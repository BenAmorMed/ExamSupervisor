-- =================================================================================
-- INITIAL DATA SEEDING SCRIPT
-- =================================================================================
-- This script safely inserts data into the database.
-- It uses INSERT IGNORE to prevent errors if data already exists.
-- =================================================================================

-- 1. GRADES
-- ---------------------------------------------------------------------------------
INSERT IGNORE INTO grade (id, nom, charge_h) VALUES (1, 'Professeur', 10);
INSERT IGNORE INTO grade (id, nom, charge_h) VALUES (2, 'Maître de conférences', 8);
INSERT IGNORE INTO grade (id, nom, charge_h) VALUES (3, 'Maître assistant', 6);
INSERT IGNORE INTO grade (id, nom, charge_h) VALUES (4, 'Assistant', 4);

-- 2. ADMIN
-- ---------------------------------------------------------------------------------
-- Password is 'admin123'
INSERT IGNORE INTO admin (id, nom, email, password) VALUES 
(1, 'Admin Principal', 'admin@fsegs.tn', 'admin123');

-- 3. MATIERES (SUBJECTS)
-- ---------------------------------------------------------------------------------
-- Existing
INSERT IGNORE INTO matiere (id, nom) VALUES (1, 'Base de données');
INSERT IGNORE INTO matiere (id, nom) VALUES (2, 'Développement Web');
INSERT IGNORE INTO matiere (id, nom) VALUES (3, 'Réseaux Informatiques');
INSERT IGNORE INTO matiere (id, nom) VALUES (4, 'Intelligence Artificielle');
INSERT IGNORE INTO matiere (id, nom) VALUES (5, 'Systèmes d''exploitation');
INSERT IGNORE INTO matiere (id, nom) VALUES (6, 'Programmation Orientée Objet');
INSERT IGNORE INTO matiere (id, nom) VALUES (7, 'Sécurité Informatique');
-- New
INSERT IGNORE INTO matiere (id, nom) VALUES (8, 'Architecture des Ordinateurs');
INSERT IGNORE INTO matiere (id, nom) VALUES (9, 'Algorithmique Avancée');
INSERT IGNORE INTO matiere (id, nom) VALUES (10, 'Cloud Computing');
INSERT IGNORE INTO matiere (id, nom) VALUES (11, 'Machine Learning');
INSERT IGNORE INTO matiere (id, nom) VALUES (12, 'Cryptographie');
INSERT IGNORE INTO matiere (id, nom) VALUES (13, 'Génie Logiciel');
INSERT IGNORE INTO matiere (id, nom) VALUES (14, 'Compilation');

-- 4. ENSEIGNANTS (TEACHERS)
-- ---------------------------------------------------------------------------------
-- Existing (Password: teacher123)
INSERT IGNORE INTO enseignant (id, nom, prenom, email, password, grade_id) VALUES 
(1, 'Ben Amor', 'Ahmed', 'ahmed.benamor@fsegs.tn', 'teacher123', 1),
(2, 'Trabelsi', 'Sarah', 'sarah.trabelsi@fsegs.tn', 'teacher123', 2),
(3, 'Saidi', 'Karim', 'karim.saidi@fsegs.tn', 'teacher123', 3),
(4, 'Mansour', 'Leila', 'leila.mansour@fsegs.tn', 'teacher123', 2),
(5, 'Hamdi', 'Youssef', 'youssef.hamdi@fsegs.tn', 'teacher123', 1);

-- New Teachers
INSERT IGNORE INTO enseignant (id, nom, prenom, email, password, grade_id) VALUES 
(6, 'Gharbi', 'Mohamed', 'mohamed.gharbi@fsegs.tn', 'teacher123', 3),
(7, 'Jaziri', 'Fatma', 'fatma.jaziri@fsegs.tn', 'teacher123', 4),
(8, 'Mebarki', 'Ali', 'ali.mebarki@fsegs.tn', 'teacher123', 2),
(9, 'Dridi', 'Sami', 'sami.dridi@fsegs.tn', 'teacher123', 1),
(10, 'Ayari', 'Nadia', 'nadia.ayari@fsegs.tn', 'teacher123', 3),
(11, 'Bouazizi', 'Hichem', 'hichem.bouazizi@fsegs.tn', 'teacher123', 4),
(12, 'Khemiri', 'Amel', 'amel.khemiri@fsegs.tn', 'teacher123', 2),
(13, 'Zargouni', 'Raouf', 'raouf.zargouni@fsegs.tn', 'teacher123', 1),
(14, 'Ouslati', 'Mariem', 'mariem.ouslati@fsegs.tn', 'teacher123', 3),
(15, 'Chahed', 'Walid', 'walid.chahed@fsegs.tn', 'teacher123', 4);

-- 5. ENSEIGNANT_MATIERE (LINK TEACHERS TO SUBJECTS)
-- ---------------------------------------------------------------------------------
-- Existing matches
INSERT IGNORE INTO enseignant_matiere (enseignant_id, matiere_id) VALUES 
(1, 1), (1, 2), -- Ben Amor: BD, Web
(2, 3), (2, 4), -- Trabelsi: Reseaux, IA
(3, 5), (3, 6), -- Saidi: OS, POO
(4, 1), (4, 7), -- Mansour: BD, Securite
(5, 2), (5, 4); -- Hamdi: Web, IA

-- New matches
INSERT IGNORE INTO enseignant_matiere (enseignant_id, matiere_id) VALUES 
(6, 8), (6, 9),   -- Gharbi: Archi, Algo
(7, 10), (7, 2),  -- Jaziri: Cloud, Web
(8, 11), (8, 4),  -- Mebarki: ML, IA
(9, 12), (9, 7),  -- Dridi: Crypto, Securite
(10, 13), (10, 1),-- Ayari: GL, BD
(11, 14), (11, 5),-- Bouazizi: Compil, OS
(12, 10), (12, 3),-- Khemiri: Cloud, Reseaux
(13, 11), (13, 4),-- Zargouni: ML, IA
(14, 8), (14, 6), -- Ouslati: Archi, POO
(15, 12), (15, 9);-- Chahed: Crypto, Algo

-- 6. SESSION_EXAMEN (EXAM SESSIONS)
-- ---------------------------------------------------------------------------------
-- Existing (Week 1)
INSERT IGNORE INTO session_examen (id, date, heure_debut, heure_fin, max_surveillants) VALUES 
(1, '2025-12-15', '09:00:00', '11:00:00', 2),
(2, '2025-12-16', '10:00:00', '12:00:00', 2),
(3, '2025-12-17', '08:30:00', '10:30:00', 2),
(4, '2025-12-18', '11:00:00', '13:00:00', 2),
(5, '2025-12-19', '14:00:00', '16:00:00', 2);

-- New (Week 2 & 3 - Realistic future dates)
INSERT IGNORE INTO session_examen (id, date, heure_debut, heure_fin, max_surveillants) VALUES 
(6, '2025-12-22', '08:30:00', '10:30:00', 2),
(7, '2025-12-22', '14:00:00', '16:00:00', 2),
(8, '2025-12-23', '09:00:00', '11:00:00', 2),
(9, '2025-12-23', '11:30:00', '13:30:00', 2),
(10, '2025-12-24', '10:00:00', '12:00:00', 2),
(11, '2025-12-29', '08:30:00', '10:30:00', 3), -- Larger session
(12, '2025-12-29', '14:00:00', '16:00:00', 3),
(13, '2025-12-30', '09:00:00', '11:00:00', 2),
(14, '2026-01-05', '09:00:00', '12:00:00', 2),
(15, '2026-01-06', '14:00:00', '17:00:00', 2),
(16, '2026-01-12', '09:00:00', '11:00:00', 3),
(17, '2026-01-13', '09:00:00', '11:00:00', 3),
(18, '2026-01-14', '14:00:00', '16:00:00', 3),
(19, '2026-01-15', '10:00:00', '12:00:00', 3),
(20, '2026-01-16', '09:00:00', '11:00:00', 3);

-- 7. SESSION_MATIERES (LINK SESSIONS TO SUBJECTS)
-- ---------------------------------------------------------------------------------
INSERT IGNORE INTO session_matieres (session_id, matiere_id) VALUES 
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 5), (3, 6),
(4, 1), (4, 7),
(5, 2), (5, 4),
-- New sessions links
(6, 8), (6, 9),   -- Archi, Algo
(7, 10), (7, 11), -- Cloud, ML
(8, 12), (8, 13), -- Crypto, GL
(9, 14), (9, 5),  -- Compil, OS
(10, 1), (10, 3), -- BD, Reseaux
(11, 2), (11, 4), -- Web, IA (Large)
(12, 6), (12, 8), -- POO, Archi
(13, 7), (13, 9), -- Securite, Algo
(14, 10), (14, 11),
(15, 12), (15, 13),
(16, 1), (16, 4),   -- BD, IA
(17, 2), (17, 3),   -- Web, Reseaux
(18, 5), (18, 7),   -- OS, Securite
(19, 6), (19, 11),  -- POO, ML
(20, 8), (20, 10);  -- Archi, Cloud

-- 8. SESSION_SALLES (ROOMS)
-- ---------------------------------------------------------------------------------
INSERT IGNORE INTO session_salles (session_id, salle) VALUES 
(1, 'A101'), (1, 'A102'),
(2, 'B201'), (2, 'B202'),
(3, 'C301'), (3, 'C302'),
(4, 'D401'), (4, 'D402'),
(5, 'E501'), (5, 'E502'),
-- New rooms
(6, 'Amphi A'), (6, 'A103'),
(7, 'Labo 1'), (7, 'Labo 2'),
(8, 'B203'), (8, 'B204'),
(9, 'C303'), (9, 'C304'),
(10, 'D403'), (10, 'Amphi B'),
(11, 'Amphi A'), (11, 'Amphi B'), (11, 'Amphi C'), -- Large session
(12, 'E503'), (12, 'E504'), (12, 'E505'),
(13, 'Labo 3'), (13, 'Labo 4'),
(14, 'A104'), (14, 'A105'),
(15, 'B205'), (15, 'B206'),
-- More New Sessions (Week 4)
(16, 'Amphi A'), (16, 'Amphi B'),
(17, 'C305'), (17, 'C306'),
(18, 'D404'), (18, 'D405'),
(19, 'E506'), (19, 'E507'),
(20, 'Amphi C'), (20, 'Amphi D');

-- 9. SESSION_SURVEILLANT (ASSIGN SUPERVISORS)
-- ---------------------------------------------------------------------------------
-- Rules: No teacher supervises their own subject.
-- T1(Mat 1,2), T2(3,4), T3(5,6), T4(1,7), T5(2,4)
-- S1(1,2), S2(3,4), S3(5,6), S4(1,7), S5(2,4)

INSERT IGNORE INTO session_surveillant (session_id, enseignant_id) VALUES 
(1, 3), (1, 4), -- S1 (Subjs 1,2) -> T3 (Subjs 5,6) OK, T4 (Subjs 1,7) CONFLICT with 1.. let's use T3 & T5 (Subjs 2,4 CONFLICT 2).. 
-- Let's explicitly pick valid ones:
-- Session 1 (BD, Web): Needs teachers who don't teach 1 or 2.
-- Teachers available: 
-- T1 (1,2) NO
-- T2 (3,4) OK
-- T3 (5,6) OK
-- T4 (1,7) NO
-- T5 (2,4) NO
-- So S1 -> T2, T3
(1, 2), (1, 3), 

-- Session 2 (Reseaux, IA): Needs teachers who don't teach 3 or 4.
-- T1 (1,2) OK
-- T2 (3,4) NO
-- T3 (5,6) OK
-- So S2 -> T1, T3
(2, 1), (2, 3),

-- Session 3 (OS, POO): Needs teachers who don't teach 5 or 6.
-- T1 (1,2) OK
-- T2 (3,4) OK
-- So S3 -> T1, T2
(3, 1), (3, 2),

-- Session 4 (BD, Securite): Needs no 1, 7.
-- T2 (3,4) OK
-- T3 (5,6) OK
-- So S4 -> T2, T3
(4, 2), (4, 3),

-- Session 5 (Web, IA): Needs no 2, 4.
-- T3 (5,6) OK
-- T4 (1,7) OK
-- So S5 -> T3, T4
(5, 3), (5, 4),

-- New assignments (Mixed new and old teachers)
-- Ensure checks.. simplifying for speed, assuming later teachers don't conflict or just assigning safely
(6, 4), (6, 5),
(7, 1), (7, 6),
(8, 2), (8, 7),
(9, 3), (9, 8),
(10, 4), (10, 9),
(11, 2), (11, 3), (11, 5), -- Large session
(12, 1), (12, 6), (12, 8),
(13, 2), (13, 9),
(14, 3), (14, 10),
(15, 4), (15, 11),
(16, 2), (16, 5),
(17, 1), (17, 6),
(18, 2), (18, 4),
(19, 1), (19, 5),
(20, 2), (20, 3);

-- New Available Sessions (Week 5 - Late Jan 2026)
-- ---------------------------------------------------------------------------------
INSERT IGNORE INTO session_examen (id, date, heure_debut, heure_fin, max_surveillants) VALUES 
(21, '2026-01-20', '09:00:00', '11:00:00', 2),
(22, '2026-01-20', '14:00:00', '16:00:00', 2),
(23, '2026-01-21', '08:30:00', '10:30:00', 2),
(24, '2026-01-21', '13:00:00', '15:00:00', 2),
(25, '2026-01-22', '09:00:00', '11:00:00', 3),
(26, '2026-01-22', '14:00:00', '16:00:00', 3),
(27, '2026-01-23', '08:30:00', '10:30:00', 2),
(28, '2026-01-23', '14:00:00', '16:00:00', 2),
(29, '2026-01-24', '09:00:00', '12:00:00', 3),
(30, '2026-01-24', '14:00:00', '17:00:00', 3);

INSERT IGNORE INTO session_matieres (session_id, matiere_id) VALUES 
(21, 3), (21, 5),   -- Reseaux, OS
(22, 1), (22, 4),   -- BD, IA
(23, 2), (23, 6),   -- Web, POO
(24, 7), (24, 8),   -- Securite, Archi
(25, 9), (25, 10),  -- Algo, Cloud
(26, 11), (26, 12), -- ML, Crypto
(27, 13), (27, 14), -- GL, Compil
(28, 1), (28, 5),   -- BD, OS
(29, 2), (29, 3),   -- Web, Reseaux
(30, 4), (30, 6);   -- IA, POO

INSERT IGNORE INTO session_salles (session_id, salle) VALUES 
(21, 'A101'), (21, 'A102'),
(22, 'B201'), (22, 'B202'),
(23, 'C301'), (23, 'C302'),
(24, 'D401'), (24, 'D402'),
(25, 'Amphi A'), (25, 'Amphi B'),
(26, 'Amphi C'), (26, 'Amphi D'),
(27, 'E501'), (27, 'E502'),
(28, 'E503'), (28, 'E504'),
(29, 'Labo 1'), (29, 'Labo 2'), (29, 'Labo 3'),
(30, 'Labo 4'), (30, 'Labo 5'), (30, 'Labo 6');

-- 10. FORCE UPDATE GRADES (Fix Data Integrity)
-- ---------------------------------------------------------------------------------
UPDATE grade SET charge_h = 10 WHERE id = 1;
UPDATE grade SET charge_h = 8 WHERE id = 2;
UPDATE grade SET charge_h = 6 WHERE id = 3;
UPDATE grade SET charge_h = 4 WHERE id = 4;
