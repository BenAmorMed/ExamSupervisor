# Use an official OpenJDK runtime as a parent image
FROM openjdk:17-jdk-slim

# Set the working directory in the container
WORKDIR /app

# Install Maven manually
RUN apt-get update && apt-get install -y maven

# Copy the Maven wrapper and pom.xml first (for better layer caching)
COPY ["projet CL/projet/mvnw", "./"]
COPY ["projet CL/projet/.mvn/wrapper/maven-wrapper.jar", ".mvn/wrapper/"]
COPY ["projet CL/projet/.mvn/wrapper/maven-wrapper.properties", ".mvn/wrapper/"]
COPY ["projet CL/projet/pom.xml", "./"]

# Make the mvnw script executable
RUN chmod +x mvnw

# Copy the rest of the application code
COPY ["projet CL/projet/src", "./src/"]

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose the port the app runs on
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/*.jar"]
