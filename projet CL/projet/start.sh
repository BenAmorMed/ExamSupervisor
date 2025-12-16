#!/bin/bash
chmod +x mvnw
./mvnw clean package -DskipTests
java -jar target/*.jar
