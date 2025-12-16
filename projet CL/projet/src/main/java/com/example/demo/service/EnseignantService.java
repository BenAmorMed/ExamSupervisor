package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entites.Enseignant;
import com.example.demo.entites.SessionExamen;
import com.example.demo.repository.EnseignantRepo;
import com.example.demo.repository.SessionExamenRepo;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class EnseignantService implements IEnseignantService {
	private final EnseignantRepo enseignantRepo;
	private final SessionExamenRepo examenRepo;
	private final EmailService emailService;

	@Override
	public Enseignant login(String identifier, String password) {
		Enseignant e = enseignantRepo.findByEmailAndPassword(identifier, password);
		if (e == null) {
			e = enseignantRepo.findByNomAndPassword(identifier, password);
		}
		return e;
	}

	@Override
	@Transactional(readOnly = true)
	public org.springframework.data.domain.Page<SessionExamen> getAllSessions(
			org.springframework.data.domain.Pageable pageable) {
		return examenRepo.findAll(pageable);
	}

	@Override
	@Transactional(readOnly = true)
	public List<SessionExamen> getDisponibilite(Long id) {
		return examenRepo.findAvailableSessions(id);
	}

	@Override
	@Transactional(readOnly = true)
	public List<SessionExamen> getSessionsWithAllMatieres(Long enseignantId) {
		Enseignant e = enseignantRepo.findById(enseignantId)
				.orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

		// إذا كان الأستاذ لا يدرس أي مواد، إرجاع قائمة فارغة
		if (e.getMatieres().isEmpty()) {
			return List.of();
		}

		return examenRepo.findSessionsWithAllTeacherMatieres(enseignantId);
	}

	@Override
	@Transactional
	public SessionExamen choisirSession(Long enseignantId, Long sessionId) {

		Enseignant e = enseignantRepo.findById(enseignantId)
				.orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

		SessionExamen s = examenRepo.findById(sessionId)
				.orElseThrow(() -> new RuntimeException("Session introuvable"));

		if (!s.estDisponible()) {
			throw new RuntimeException("Session complète !");
		}

		// Check if teacher is already at full charge
		long currentMinutes = e.calculeHoursSelcted();
		long chargeMinutes = e.getGrade().getChargeH() * 60L;

		if (e.isFullCharge()) {
			throw new RuntimeException(
					"Charge complète (Backend)! Current: " + currentMinutes + "m, Max: " + chargeMinutes + "m");
		}

		// Calculate if adding this session would exceed the charge
		long sessionMinutes = java.time.Duration.between(s.getHeureDebut(), s.getHeureFin()).toMinutes();

		if (currentMinutes + sessionMinutes > chargeMinutes) {
			throw new RuntimeException("Sélectionner cette session dépasserait votre charge complète !");
		}

		// Check for time conflict with existing sessions
		boolean conflict = e.getSurveillances().stream()
				.anyMatch(sess -> sess.overlapWith(s.getDate(), s.getHeureDebut(), s.getHeureFin()));

		if (conflict) {
			throw new RuntimeException("Cette session est en conflit avec une de vos sessions existantes !");
		}

		// Check if teacher teaches any subject in this session (Interest Conflict)
		boolean subjectConflict = s.getMatieres().stream()
				.anyMatch(m -> e.getMatieres().contains(m));

		if (subjectConflict) {
			throw new RuntimeException(
					"Conflit d'intérêts : Vous ne pouvez pas surveiller un examen de votre propre matière !");
		}

		// use helper method
		s.addSuerveillant(e);

		return examenRepo.save(s);
	}

	@Override
	@Transactional
	public void annulerChoix(Long enseignantId, Long sessionId) {
		Enseignant e = enseignantRepo.findById(enseignantId)
				.orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

		SessionExamen s = examenRepo.findById(sessionId)
				.orElseThrow(() -> new RuntimeException("Session introuvable"));

		if (!s.getSurveillants().contains(e)) {
			throw new RuntimeException("L'enseignant est n'a pas un servillant dans cette seance ");
		}

		s.getSurveillants().remove(e);
		e.getSurveillances().remove(s);

		examenRepo.save(s);
		enseignantRepo.save(e);
	}

	@Override
	public List<SessionExamen> mesSeances(Long enseignantId) {
		Enseignant e = enseignantRepo.findById(enseignantId)
				.orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

		return e.getSurveillances().stream().toList();
	}

	@Override
	@Transactional
	public void assignRandomSessionsToCompleteCharge() {
		// 1️⃣ الحصول على أول جلسة لتحديد بداية الأسبوع
		SessionExamen firstSession = examenRepo.findFirstByOrderByDateAsc();
		if (firstSession == null)
			return; // لا توجد جلسات

		// 2️⃣ التاريخ قبل 3 أيام
		LocalDate limitDate = firstSession.getDate().minusDays(3);

		// 3️⃣ الأساتذة الذين لم يكملوا شحنتهم
		List<Enseignant> enseignants = enseignantRepo.findAll()
				.stream()
				.filter(e -> !e.isFullCharge())
				.toList();

		if (enseignants.isEmpty())
			return; // كل الأساتذة مكتملين

		java.util.Random random = new java.util.Random();

		// 5️⃣ تعيين كل أستاذ لجلسات عشوائية حتى اكتمال الشحنة
		for (Enseignant e : enseignants) {
			boolean assignedAny = false;
			// إعادة جلب الأستاذ من قاعدة البيانات لضمان الحصول على أحدث البيانات
			Enseignant teacher = enseignantRepo.findById(e.getId())
					.orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

			if (teacher.isFullCharge()) {
				continue; // تخطي الأستاذ إذا أصبحت شحنته مكتملة
			}

			// 4️⃣ الحصول على الجلسات المتاحة لهذا الأستاذ فقط (مع مراعاة المواد والقيود
			// الأخرى)
			List<SessionExamen> availableSessions = examenRepo.findAvailableSessions(teacher.getId())
					.stream()
					.filter(s -> !s.getDate().isAfter(limitDate))
					.collect(Collectors.toList());

			if (availableSessions.isEmpty())
				continue; // لا توجد جلسات متاحة لهذا الأستاذ

			// حساب الدقائق المتبقية للوصول للشحنة الكاملة
			long chosenMinutes = teacher.calculeHoursSelcted();
			long chargeMinutes = teacher.getGrade().getChargeH() * 60L;
			long remainingMinutes = chargeMinutes - chosenMinutes;

			int attempts = 0;
			int maxAttempts = availableSessions.size() * 2; // لتجنب الحلقة اللانهائية

			while (remainingMinutes > 0 && !availableSessions.isEmpty() && attempts < maxAttempts) {
				attempts++;

				// إعادة جلب الجلسات المتاحة بعد كل تعديل (لتحديث حالة الامتلاء)
				availableSessions = examenRepo.findAvailableSessions(teacher.getId())
						.stream()
						.filter(s -> !s.getDate().isAfter(limitDate))
						.collect(Collectors.toList());

				if (availableSessions.isEmpty())
					break;

				// اختيار جلسة عشوائية
				SessionExamen randomSession = availableSessions.get(random.nextInt(availableSessions.size()));

				// التأكد من عدم التعارض مع جلسات الأستاذ الحالية
				boolean conflict = teacher.getSurveillances().stream()
						.anyMatch(sess -> sess.overlapWith(
								randomSession.getDate(),
								randomSession.getHeureDebut(),
								randomSession.getHeureFin()));

				if (!conflict && randomSession.estDisponible()) {
					long sessionMinutes = java.time.Duration.between(
							randomSession.getHeureDebut(), randomSession.getHeureFin()).toMinutes();

					// التأكد من عدم تجاوز الشحنة
					if (remainingMinutes >= sessionMinutes) {
						// استخدام الدالة الموجودة لضمان العلاقات الثنائية
						randomSession.addSuerveillant(teacher);

						// حفظ التغييرات
						examenRepo.save(randomSession);
						teacher = enseignantRepo.findById(teacher.getId())
								.orElseThrow(() -> new RuntimeException("Enseignant introuvable"));

						// تحديث الدقائق المتبقية
						chosenMinutes = teacher.calculeHoursSelcted();
						remainingMinutes = chargeMinutes - chosenMinutes;

						attempts = 0; // إعادة تعيين المحاولات عند النجاح
						assignedAny = true;
					} else {
						// الجلسة طويلة جدًا، إزالتها من القائمة
						availableSessions.remove(randomSession);
					}
				} else {
					// إزالة الجلسة المتعارضة أو الممتلئة
					availableSessions.remove(randomSession);
				}
			}

			// حفظ الأستاذ بعد التعيين
			enseignantRepo.save(teacher);

			// Send email if any assignment was made
			if (assignedAny) {
				emailService.sendCalendar(teacher);
			}
		}
	}

	@Transactional
	public void assignSessionsForTeacher(Long enseignantId) {

		// 1️⃣ Fetch teacher and check charge
		Enseignant enseignant = enseignantRepo.findById(enseignantId)
				.orElseThrow(() -> new RuntimeException("Teacher not found"));

		if (enseignant.isFullCharge()) {
			return; // No need to assign
		}

		java.util.Random random = new java.util.Random();

		// 3️⃣ Remaining time to reach teacher full charge
		long chosenMinutes = enseignant.calculeHoursSelcted();
		long chargeMinutes = enseignant.getGrade().getChargeH() * 60L;
		long remainingMinutes = chargeMinutes - chosenMinutes;

		int attempts = 0;
		int maxAttempts = 100; // لتجنب الحلقة اللانهائية

		while (remainingMinutes > 0 && attempts < maxAttempts) {
			attempts++;

			// 2️⃣ Get fresh available sessions (repository rule applied)
			List<SessionExamen> availableSessions = examenRepo.findAvailableSessions(enseignantId);

			if (availableSessions.isEmpty())
				break;

			// إعادة جلب الأستاذ من قاعدة البيانات لضمان الحصول على أحدث البيانات
			enseignant = enseignantRepo.findById(enseignantId)
					.orElseThrow(() -> new RuntimeException("Teacher not found"));

			if (enseignant.isFullCharge()) {
				break; // الشحنة مكتملة الآن
			}

			// تحديث الدقائق المتبقية
			chosenMinutes = enseignant.calculeHoursSelcted();
			remainingMinutes = chargeMinutes - chosenMinutes;

			if (remainingMinutes <= 0)
				break;

			SessionExamen randomSession = availableSessions.get(random.nextInt(availableSessions.size()));

			// Check date/time conflict
			boolean conflict = enseignant.getSurveillances().stream()
					.anyMatch(sess -> sess.overlapWith(
							randomSession.getDate(),
							randomSession.getHeureDebut(),
							randomSession.getHeureFin()));

			if (!conflict && randomSession.estDisponible()) {
				long sessionMinutes = java.time.Duration.between(
						randomSession.getHeureDebut(), randomSession.getHeureFin()).toMinutes();

				// التأكد من عدم تجاوز الشحنة
				if (remainingMinutes >= sessionMinutes) {
					// 4️⃣ Assign using 2-way relation method
					randomSession.addSuerveillant(enseignant);

					// حفظ التغييرات
					examenRepo.save(randomSession);
					enseignant = enseignantRepo.findById(enseignantId)
							.orElseThrow(() -> new RuntimeException("Teacher not found"));

					attempts = 0; // إعادة تعيين المحاولات عند النجاح
				}
			}
		}

		// Save final state
		enseignantRepo.save(enseignant);
	}

	@Override
	public Enseignant getById(Long id) {
		return enseignantRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
	}

}
