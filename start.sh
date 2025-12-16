#!/bin/bash
cd "projet CL/projet"
chmod +x mvnw
./mvnw clean package -DskipTests
java -jar target/*.jar
