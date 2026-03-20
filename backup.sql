-- MySQL dump 10.13  Distrib 8.0.45, for macos15 (x86_64)
--
-- Host: localhost    Database: newback_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Brigades`
--

DROP TABLE IF EXISTS `Brigades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Brigades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `detachmentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `detachmentId` (`detachmentId`),
  CONSTRAINT `brigades_ibfk_1` FOREIGN KEY (`detachmentId`) REFERENCES `Detachments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Brigades`
--

LOCK TABLES `Brigades` WRITE;
/*!40000 ALTER TABLE `Brigades` DISABLE KEYS */;
INSERT INTO `Brigades` VALUES (1,'23 ДПРЧ','2026-03-03 12:44:40','2026-03-12 21:44:30',1),(2,'22 ДПРЧ','2026-03-03 12:44:40','2026-03-12 21:44:22',1),(3,'3 ДПРЧ','2026-03-03 12:44:40','2026-03-03 12:44:40',2);
/*!40000 ALTER TABLE `Brigades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Detachments`
--

DROP TABLE IF EXISTS `Detachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Detachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `name_24` (`name`),
  UNIQUE KEY `name_25` (`name`),
  UNIQUE KEY `name_26` (`name`),
  UNIQUE KEY `name_27` (`name`),
  UNIQUE KEY `name_28` (`name`),
  UNIQUE KEY `name_29` (`name`),
  UNIQUE KEY `name_30` (`name`),
  UNIQUE KEY `name_31` (`name`),
  UNIQUE KEY `name_32` (`name`),
  UNIQUE KEY `name_33` (`name`),
  UNIQUE KEY `name_34` (`name`),
  UNIQUE KEY `name_35` (`name`),
  UNIQUE KEY `name_36` (`name`),
  UNIQUE KEY `name_37` (`name`),
  UNIQUE KEY `name_38` (`name`),
  UNIQUE KEY `name_39` (`name`),
  UNIQUE KEY `name_40` (`name`),
  UNIQUE KEY `name_41` (`name`),
  UNIQUE KEY `name_42` (`name`),
  UNIQUE KEY `name_43` (`name`),
  UNIQUE KEY `name_44` (`name`),
  UNIQUE KEY `name_45` (`name`),
  UNIQUE KEY `name_46` (`name`),
  UNIQUE KEY `name_47` (`name`),
  UNIQUE KEY `name_48` (`name`),
  UNIQUE KEY `name_49` (`name`),
  UNIQUE KEY `name_50` (`name`),
  UNIQUE KEY `name_51` (`name`),
  UNIQUE KEY `name_52` (`name`),
  UNIQUE KEY `name_53` (`name`),
  UNIQUE KEY `name_54` (`name`),
  UNIQUE KEY `name_55` (`name`),
  UNIQUE KEY `name_56` (`name`),
  UNIQUE KEY `name_57` (`name`),
  UNIQUE KEY `name_58` (`name`),
  UNIQUE KEY `name_59` (`name`),
  UNIQUE KEY `name_60` (`name`),
  UNIQUE KEY `name_61` (`name`),
  UNIQUE KEY `name_62` (`name`),
  UNIQUE KEY `name_63` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Detachments`
--

LOCK TABLES `Detachments` WRITE;
/*!40000 ALTER TABLE `Detachments` DISABLE KEYS */;
INSERT INTO `Detachments` VALUES (1,'2 ДПРЗ','2026-03-03 12:44:40','2026-03-03 12:44:40'),(2,'3 ДПРЗ','2026-03-03 12:44:40','2026-03-03 12:44:40');
/*!40000 ALTER TABLE `Detachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ElectricStations`
--

DROP TABLE IF EXISTS `ElectricStations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ElectricStations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `yaerOfPurchase` int NOT NULL,
  `powerOf` float NOT NULL,
  `placeOfStorage` varchar(255) NOT NULL,
  `notes` text,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `name_24` (`name`),
  UNIQUE KEY `name_25` (`name`),
  UNIQUE KEY `name_26` (`name`),
  UNIQUE KEY `name_27` (`name`),
  UNIQUE KEY `name_28` (`name`),
  UNIQUE KEY `name_29` (`name`),
  UNIQUE KEY `name_30` (`name`),
  UNIQUE KEY `name_31` (`name`),
  UNIQUE KEY `name_32` (`name`),
  UNIQUE KEY `name_33` (`name`),
  UNIQUE KEY `name_34` (`name`),
  UNIQUE KEY `name_35` (`name`),
  UNIQUE KEY `name_36` (`name`),
  UNIQUE KEY `name_37` (`name`),
  UNIQUE KEY `name_38` (`name`),
  UNIQUE KEY `name_39` (`name`),
  UNIQUE KEY `name_40` (`name`),
  UNIQUE KEY `name_41` (`name`),
  UNIQUE KEY `name_42` (`name`),
  UNIQUE KEY `name_43` (`name`),
  UNIQUE KEY `name_44` (`name`),
  UNIQUE KEY `name_45` (`name`),
  UNIQUE KEY `name_46` (`name`),
  UNIQUE KEY `name_47` (`name`),
  UNIQUE KEY `name_48` (`name`),
  UNIQUE KEY `name_49` (`name`),
  UNIQUE KEY `name_50` (`name`),
  UNIQUE KEY `name_51` (`name`),
  UNIQUE KEY `name_52` (`name`),
  UNIQUE KEY `name_53` (`name`),
  UNIQUE KEY `name_54` (`name`),
  UNIQUE KEY `name_55` (`name`),
  UNIQUE KEY `name_56` (`name`),
  UNIQUE KEY `name_57` (`name`),
  UNIQUE KEY `name_58` (`name`),
  UNIQUE KEY `name_59` (`name`),
  UNIQUE KEY `name_60` (`name`),
  UNIQUE KEY `name_61` (`name`),
  UNIQUE KEY `name_62` (`name`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `electricstations_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ElectricStations`
--

LOCK TABLES `ElectricStations` WRITE;
/*!40000 ALTER TABLE `ElectricStations` DISABLE KEYS */;
INSERT INTO `ElectricStations` VALUES (1,'BOSCH G2400',2022,2,'Склад','арз',2,'2026-03-10 17:55:49','2026-03-10 17:55:49'),(2,'bosh',2022,66,'Залучені','рівненська обл вараш район село 23 вулиця 34',3,'2026-03-10 18:01:59','2026-03-14 21:00:57'),(11,'sdcsdc',232,121,'Готові до залучення','12e',3,'2026-03-10 18:09:52','2026-03-10 18:09:52'),(12,'sdsas',2321,2312,'Резервне живлення підрозділів','11sds',3,'2026-03-10 18:10:22','2026-03-10 18:10:22');
/*!40000 ALTER TABLE `ElectricStations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ExtenguisDocumentLinks`
--

DROP TABLE IF EXISTS `ExtenguisDocumentLinks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ExtenguisDocumentLinks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `documentName` varchar(255) NOT NULL,
  `documentLink` varchar(255) NOT NULL,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `extenguisdocumentlinks_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ExtenguisDocumentLinks`
--

LOCK TABLES `ExtenguisDocumentLinks` WRITE;
/*!40000 ALTER TABLE `ExtenguisDocumentLinks` DISABLE KEYS */;
/*!40000 ALTER TABLE `ExtenguisDocumentLinks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FoamAgents`
--

DROP TABLE IF EXISTS `FoamAgents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FoamAgents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehiclePassed` int DEFAULT NULL,
  `vehicleNotPassed` int DEFAULT NULL,
  `wherehousePassed` int DEFAULT NULL,
  `wherehouseNotPassed` int DEFAULT NULL,
  `cannisteroVolume` int DEFAULT NULL,
  `barrelVolume` int DEFAULT NULL,
  `ibcVolume` int DEFAULT NULL,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `foamagents_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FoamAgents`
--

LOCK TABLES `FoamAgents` WRITE;
/*!40000 ALTER TABLE `FoamAgents` DISABLE KEYS */;
INSERT INTO `FoamAgents` VALUES (1,400,0,700,0,50,500,50,2,'2026-03-12 16:26:11','2026-03-15 08:00:48'),(2,0,0,0,0,1000,300,7000,2,'2026-03-12 16:26:40','2026-03-12 16:26:40'),(3,4400,2220,6003,1000,3003,2000,2000,1,'2026-03-12 16:49:50','2026-03-12 21:13:16');
/*!40000 ALTER TABLE `FoamAgents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HydravlicTools`
--

DROP TABLE IF EXISTS `HydravlicTools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HydravlicTools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `yaerOfPurchase` int NOT NULL,
  `typeOfStern` varchar(255) NOT NULL,
  `placeOfStorage` varchar(255) NOT NULL,
  `notes` text,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `hydravlictools_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HydravlicTools`
--

LOCK TABLES `HydravlicTools` WRITE;
/*!40000 ALTER TABLE `HydravlicTools` DISABLE KEYS */;
/*!40000 ALTER TABLE `HydravlicTools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Powders`
--

DROP TABLE IF EXISTS `Powders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Powders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehiclePowderPassed` int DEFAULT NULL,
  `vehiclePowderNotPassed` int DEFAULT NULL,
  `werhousePowderPassed` int DEFAULT NULL,
  `werhousePowderNotPassed` int DEFAULT NULL,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `powders_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Powders`
--

LOCK TABLES `Powders` WRITE;
/*!40000 ALTER TABLE `Powders` DISABLE KEYS */;
INSERT INTO `Powders` VALUES (1,1000,20000,2999,2990,1,'2026-03-12 17:32:11','2026-03-12 17:39:02'),(2,5000,0,8000,1000,2,'2026-03-15 07:59:21','2026-03-15 07:59:21');
/*!40000 ALTER TABLE `Powders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SwimTools`
--

DROP TABLE IF EXISTS `SwimTools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SwimTools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lifeBoat` int DEFAULT NULL,
  `motorLifeBoat` int DEFAULT NULL,
  `lifeBouy` int DEFAULT NULL,
  `lifeRoup` int DEFAULT NULL,
  `lifePath` int DEFAULT NULL,
  `rescueSlad` int DEFAULT NULL,
  `lifeJacket` int DEFAULT NULL,
  `drySuits` int DEFAULT NULL,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `swimtools_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SwimTools`
--

LOCK TABLES `SwimTools` WRITE;
/*!40000 ALTER TABLE `SwimTools` DISABLE KEYS */;
INSERT INTO `SwimTools` VALUES (1,0,0,2,0,0,0,0,0,1,'2026-03-10 20:58:23','2026-03-14 21:00:57'),(2,2,2,3,1,1,1,0,0,3,'2026-03-11 07:00:19','2026-03-14 21:00:57');
/*!40000 ALTER TABLE `SwimTools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TestItems`
--

DROP TABLE IF EXISTS `TestItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TestItems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `result` varchar(255) DEFAULT NULL,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `inventoryNumber` varchar(255) DEFAULT NULL,
  `testDate` datetime DEFAULT NULL,
  `nextTestDate` datetime DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `linkName` varchar(255) DEFAULT NULL,
  `testListId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  KEY `testListId` (`testListId`),
  CONSTRAINT `testitems_ibfk_3` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `testitems_ibfk_4` FOREIGN KEY (`testListId`) REFERENCES `testLists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TestItems`
--

LOCK TABLES `TestItems` WRITE;
/*!40000 ALTER TABLE `TestItems` DISABLE KEYS */;
INSERT INTO `TestItems` VALUES (1,'вдівсівсів','pass',2,'2026-03-04 18:03:39','2026-03-08 11:54:47','1','2026-03-05 00:00:00','2026-03-19 00:00:00','http://localhost:5173/tests',NULL,NULL),(2,'Pressure t','pass',2,'2026-03-04 18:03:43','2026-03-05 20:09:50',NULL,NULL,NULL,NULL,NULL,NULL),(3,'Pree t','pass',2,'2026-03-04 18:03:46','2026-03-05 20:09:32',NULL,NULL,NULL,NULL,NULL,NULL),(4,'Pree t','pass',2,'2026-03-04 18:03:50','2026-03-05 20:09:32',NULL,NULL,NULL,NULL,NULL,NULL),(5,'Prівмівмім t','pass',2,'2026-03-04 18:03:54','2026-03-05 20:09:50',NULL,NULL,NULL,NULL,NULL,NULL),(6,'Prісмів22222 t','pass',3,'2026-03-04 18:04:01','2026-03-04 19:28:42',NULL,NULL,NULL,NULL,NULL,NULL),(7,'Prісм34534535','pass',2,'2026-03-04 18:04:11','2026-03-05 20:09:50',NULL,NULL,NULL,NULL,NULL,NULL),(8,'Prівапавппа5','pass',2,'2026-03-04 18:04:15','2026-03-05 20:09:50',NULL,NULL,NULL,NULL,NULL,NULL),(9,'546н45н4кпв','pass',2,'2026-03-04 18:04:19','2026-03-05 20:09:32',NULL,NULL,NULL,NULL,NULL,NULL),(10,'ауваувсу','pass',2,'2026-03-04 18:36:57','2026-03-04 18:36:57',NULL,NULL,NULL,NULL,NULL,NULL),(11,'мотузок','pass',2,'2026-03-04 18:38:07','2026-03-05 20:09:50',NULL,NULL,NULL,NULL,NULL,12),(12,'авотаов','pass',2,'2026-03-04 18:38:20','2026-03-04 18:38:20',NULL,NULL,NULL,NULL,NULL,NULL),(13,'ііііііііі','fail',2,'2026-03-04 18:38:31','2026-03-08 11:49:07','2','2026-03-20 00:00:00','2026-03-19 00:00:00','http://localhost:5173/tests',NULL,NULL),(14,'іапваваппвап','pass',2,'2026-03-04 18:38:37','2026-03-05 20:09:32',NULL,NULL,NULL,NULL,NULL,NULL),(15,'вамвмама','pass',3,'2026-03-04 18:38:50','2026-03-04 18:38:50',NULL,NULL,NULL,NULL,NULL,NULL),(16,'вамвамамвам','pass',3,'2026-03-04 18:38:54','2026-03-04 18:38:54',NULL,NULL,NULL,NULL,NULL,NULL),(17,'вамвамамва','pass',3,'2026-03-04 18:38:58','2026-03-04 18:38:58',NULL,NULL,NULL,NULL,NULL,NULL),(18,'2222222','pass',3,'2026-03-04 18:39:31','2026-03-04 19:28:42',NULL,NULL,NULL,NULL,NULL,NULL),(19,'2222222','pass',2,'2026-03-04 18:39:36','2026-03-08 11:51:33','1',NULL,NULL,NULL,NULL,NULL),(20,'драбина','pass',1,'2026-03-08 11:18:35','2026-03-15 08:01:23','1','2026-03-17 00:00:00','2026-03-26 00:00:00','http://localhost:5173/tests',NULL,1),(22,'драбина висувна триколінна(металева)','pass',2,'2026-03-08 12:05:28','2026-03-14 21:00:57','1','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',1),(23,'Драбина штурмова (металева)','pass',1,'2026-03-08 12:08:25','2026-03-12 21:50:52','1','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',2),(24,'драбина висувна триколінна (металева)','pass',2,'2026-03-08 12:33:56','2026-03-14 21:00:57','2','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',1),(25,'драбина','pass',2,'2026-03-08 20:04:39','2026-03-14 21:00:57','3','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',1),(26,'Драбина штурмова (металева)','pass',1,'2026-03-12 21:51:35','2026-03-12 21:51:35','2','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',2),(27,'драбина штурмова (металева)','pass',1,'2026-03-12 21:52:20','2026-03-12 21:52:20','3','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',2),(28,'драбина палиця','pass',1,'2026-03-12 21:52:59','2026-03-12 21:52:59','1','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',3),(29,'драбина палиця','pass',1,'2026-03-12 21:53:40','2026-03-12 21:53:40','2','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',3),(30,'драбина палиця','pass',1,'2026-03-12 21:54:08','2026-03-12 21:54:08','3','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',3),(31,'Рукавна затримка','pass',1,'2026-03-12 21:54:52','2026-03-12 21:54:52','1','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(32,'Рукавна затримка','pass',1,'2026-03-12 21:55:32','2026-03-12 21:55:32','2','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(33,'Рукавна затримка','pass',1,'2026-03-12 21:56:08','2026-03-12 21:56:08','3','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(34,'Рукавна затримка','pass',1,'2026-03-12 21:57:18','2026-03-12 21:57:18','4','2024-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(35,'Рукавна затримка','pass',1,'2026-03-12 21:57:53','2026-03-12 21:57:53','5','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(36,'Рукавна затримка','pass',1,'2026-03-12 21:58:25','2026-03-12 21:58:25','6','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(37,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:07:42','1','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(38,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:07:47','2','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(39,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:07:52','3','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(40,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:07:58','4','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(41,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:02','5','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(42,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:06','6','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(43,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:11','7','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(44,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:15','8','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(45,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:19','9','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(46,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:24','10','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(47,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:28','11','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(48,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:32','12','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(49,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:40','13','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(50,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:44','14','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(51,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:48','15','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(52,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:51','16','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(53,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:08:55','17','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(54,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:09:02','18','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(55,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:09:06','19','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(56,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:09:10','20','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(57,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:09:14','21','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(58,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:09:18','22','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(59,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:11:20','23','2025-11-01 00:00:00','2026-05-01 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(60,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:11:11','24','2025-11-01 00:00:00','2026-05-01 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(61,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:11:04','25','2025-11-01 00:00:00','2026-05-01 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(62,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:10:57','26','2025-11-01 00:00:00','2026-05-01 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(63,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:10:52','27','2025-11-01 00:00:00','2026-05-01 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(64,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:10:31','28','2025-11-01 00:00:00','2026-05-01 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(65,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:10:38','29','2025-11-01 00:00:00','2026-05-01 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(66,'Рятувальний пояс','pass',1,'2026-03-12 22:03:34','2026-03-12 22:10:43','30','2025-11-01 00:00:00','2026-05-01 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 01.05.2025',6),(67,'Рукавна затримка','pass',1,'2026-03-12 22:05:09','2026-03-12 22:05:09','7','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(68,'Рукавна затримка','pass',1,'2026-03-12 22:05:09','2026-03-12 22:05:09','8','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(69,'Рукавна затримка','pass',1,'2026-03-12 22:05:09','2026-03-12 22:05:09','9','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(70,'Рукавна затримка','pass',1,'2026-03-12 22:05:09','2026-03-12 22:05:09','10','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(71,'Рукавна затримка','pass',1,'2026-03-12 22:05:09','2026-03-12 22:05:09','11','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(72,'Рукавна затримка','pass',1,'2026-03-12 22:05:43','2026-03-12 22:05:43','12','2026-01-11 00:00:00','2027-01-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',5),(73,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','1','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(74,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','2','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(75,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','3','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(76,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','4','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(77,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','5','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(78,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','6','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(79,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','7','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(80,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','8','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(81,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','9','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(82,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','10','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(83,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','11','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(84,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','12','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(85,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','13','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(86,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','14','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(87,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','15','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(88,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','16','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(89,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','17','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(90,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','18','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(91,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','19','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(92,'Карабін пожежний','pass',1,'2026-03-12 22:11:59','2026-03-12 22:11:59','20','2025-11-11 00:00:00','2026-05-11 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','Акт №1 від 11.01.2026',7),(93,'Рукавиці діелектричні','pass',1,'2026-03-12 22:15:26','2026-03-15 08:16:23','2Л/2П-1','2026-03-03 00:00:00','2026-03-24 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','ццц',8),(94,'Рукавиці діелектричні','pass',1,'2026-03-12 22:15:26','2026-03-15 08:16:30','2Л/2П-2','2026-03-03 00:00:00','2026-03-24 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','ццц',8),(95,'Рукавиці діелектричні','pass',1,'2026-03-12 22:15:26','2026-03-15 08:16:33','2Л/2П-3','2026-03-03 00:00:00','2026-03-24 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','ццц',8),(96,'Рукавиці діелектричні','pass',1,'2026-03-12 22:15:26','2026-03-15 08:16:37','2Л/2П-4','2026-03-03 00:00:00','2026-03-24 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','ццц',8),(97,'Боти діелектричні','pass',1,'2026-03-12 22:19:42','2026-03-12 22:19:42','540','2024-05-16 00:00:00','2027-05-16 00:00:00','https://drive.google.com/file/d/1Q2uvHjhOXjqcH3sAlqWXbF4QngHm6PYq/view?usp=sharing','Протокол №4/24-81 від 15.04.2024 ',9),(98,'Боти діелектричні','pass',1,'2026-03-12 22:19:42','2026-03-12 22:19:42','541','2024-05-16 00:00:00','2027-05-16 00:00:00','https://drive.google.com/file/d/1Q2uvHjhOXjqcH3sAlqWXbF4QngHm6PYq/view?usp=sharing','Протокол №4/24-81 від 15.04.2024 ',9),(99,'Боти діелектричні','pass',1,'2026-03-12 22:19:42','2026-03-12 22:19:42','542','2024-05-16 00:00:00','2027-05-16 00:00:00','https://drive.google.com/file/d/1Q2uvHjhOXjqcH3sAlqWXbF4QngHm6PYq/view?usp=sharing','Протокол №4/24-81 від 15.04.2024 ',9),(100,'Боти діелектричні','pass',1,'2026-03-12 22:19:42','2026-03-12 22:19:42','543','2024-05-16 00:00:00','2027-05-16 00:00:00','https://drive.google.com/file/d/1Q2uvHjhOXjqcH3sAlqWXbF4QngHm6PYq/view?usp=sharing','Протокол №4/24-81 від 15.04.2024 ',9),(101,'Боти діелектричні','pass',1,'2026-03-12 22:19:42','2026-03-12 22:19:42','544','2024-05-16 00:00:00','2027-05-16 00:00:00','https://drive.google.com/file/d/1Q2uvHjhOXjqcH3sAlqWXbF4QngHm6PYq/view?usp=sharing','Протокол №4/24-81 від 15.04.2024 ',9),(102,'Боти діелектричні','pass',1,'2026-03-12 22:22:22','2026-03-12 22:22:22','565','2024-04-15 00:00:00','2027-04-15 00:00:00','https://drive.google.com/file/d/1Q2uvHjhOXjqcH3sAlqWXbF4QngHm6PYq/view?usp=sharing','Протокол №4/24-81 від 15.04.2024 ',9),(103,'драбина','pass',3,'2026-03-14 21:02:14','2026-03-14 21:02:42','1','2026-03-06 00:00:00','2026-07-08 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','asdasca',1),(104,'драбина','pass',3,'2026-03-14 21:02:14','2026-03-14 21:02:42','2','2026-03-06 00:00:00','2026-07-08 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','asdasca',1),(105,'драбина','pass',3,'2026-03-14 21:02:14','2026-03-14 21:02:42','3','2026-03-06 00:00:00','2026-07-08 00:00:00','https://drive.google.com/file/d/14zfIKkDhE89RrzB7VWC4wcSu9ojRyWpW/view?usp=sharing','asdasca',1);
/*!40000 ALTER TABLE `TestItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TestLinks`
--

DROP TABLE IF EXISTS `TestLinks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TestLinks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `linkSchedule` varchar(255) DEFAULT NULL,
  `linkOrder` varchar(255) DEFAULT NULL,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `testlinks_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TestLinks`
--

LOCK TABLES `TestLinks` WRITE;
/*!40000 ALTER TABLE `TestLinks` DISABLE KEYS */;
INSERT INTO `TestLinks` VALUES (1,'https://drive.google.com/file/d/1kDyRdWdyVYrGGxhcspzinjTT6or1wucf/view?usp=sharing','https://drive.google.com/file/d/1jnZjMKkWloWM6kX0800Ha9GGzsBt_keG/view?usp=sharing',1,'2026-03-03 12:45:43','2026-03-12 21:46:10'),(2,'','',3,'2026-03-08 13:03:23','2026-03-08 13:03:23');
/*!40000 ALTER TABLE `TestLinks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testLists`
--

DROP TABLE IF EXISTS `testLists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testLists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testLists`
--

LOCK TABLES `testLists` WRITE;
/*!40000 ALTER TABLE `testLists` DISABLE KEYS */;
INSERT INTO `testLists` VALUES (1,'Драбина висувна трьох колінна','2026-03-03 12:44:40','2026-03-12 21:34:38'),(2,'Драбина штурмова','2026-03-03 12:44:40','2026-03-12 21:35:14'),(3,'Драбина палиця','2026-03-04 18:03:12','2026-03-12 21:35:34'),(4,'Драбина європейського взірця','2026-03-12 21:36:02','2026-03-12 21:36:02'),(5,'Рукавні затримки','2026-03-12 21:36:22','2026-03-12 21:36:22'),(6,'Рятувальні пояси','2026-03-12 21:36:39','2026-03-12 21:36:39'),(7,'Карабіни пожежні','2026-03-12 21:38:05','2026-03-12 21:38:05'),(8,'Рукавиці гумові діелектричні','2026-03-12 21:38:24','2026-03-12 21:38:24'),(9,'Боти діелектричні','2026-03-12 21:38:42','2026-03-12 21:38:42'),(10,'Ізолюючі діелектричні ножиці','2026-03-12 21:38:58','2026-03-12 21:38:58'),(11,'Пристосування для обрізки проводів (штанга кусачка з ізолюючим канатом)','2026-03-12 21:39:21','2026-03-12 21:39:21'),(12,'Мотузка рятувальна','2026-03-12 21:39:41','2026-03-12 21:39:41'),(13,'Тельфер для підйому пожежних рукавів','2026-03-12 21:39:56','2026-03-12 21:39:56'),(14,'Пристрій для страхування','2026-03-12 21:40:14','2026-03-12 21:40:14'),(15,'Оновлення запобіжної подушки','2026-03-12 21:40:32','2026-03-12 21:40:32'),(16,'Манометри','2026-03-12 21:41:08','2026-03-12 21:41:08'),(17,'Динамометр','2026-03-12 21:41:25','2026-03-12 21:41:25'),(18,'Верхолазне спорядження','2026-03-12 21:41:42','2026-03-12 21:41:42');
/*!40000 ALTER TABLE `testLists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ToolItems`
--

DROP TABLE IF EXISTS `ToolItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ToolItems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `quantity` int DEFAULT '0',
  `notes` text,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `toolListId` int DEFAULT NULL,
  `yearOfPurchase` int DEFAULT NULL,
  `powerfull` int DEFAULT NULL,
  `storagePlace` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  KEY `toolListId` (`toolListId`),
  CONSTRAINT `toolitems_ibfk_27` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `toolitems_ibfk_28` FOREIGN KEY (`toolListId`) REFERENCES `toolLists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ToolItems`
--

LOCK TABLES `ToolItems` WRITE;
/*!40000 ALTER TABLE `ToolItems` DISABLE KEYS */;
INSERT INTO `ToolItems` VALUES (1,'мотопомпа 1111',5,'',3,'2026-03-04 18:58:40','2026-03-14 21:00:57',1,NULL,NULL,NULL),(2,'мотопомпа 12222',5,'',3,'2026-03-04 18:58:46','2026-03-14 21:00:57',1,NULL,NULL,NULL),(3,'генератор',4,'в зведеному загонітарзсп',3,'2026-03-04 18:58:57','2026-03-14 21:00:57',2,2025,235,'fw4013063'),(4,'генерат',5,'',3,'2026-03-04 18:59:01','2026-03-14 21:00:57',2,NULL,NULL,''),(5,'motogen',0,'',3,'2026-03-04 19:29:35','2026-03-14 21:00:57',1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `ToolItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `toolLists`
--

DROP TABLE IF EXISTS `toolLists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `toolLists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `toolLists`
--

LOCK TABLES `toolLists` WRITE;
/*!40000 ALTER TABLE `toolLists` DISABLE KEYS */;
INSERT INTO `toolLists` VALUES (1,'Бензопили','2026-03-04 18:57:30','2026-03-10 20:29:34'),(2,'Бензорізи','2026-03-04 18:57:41','2026-03-10 20:30:26'),(3,'Пневматика','2026-03-10 20:30:54','2026-03-10 20:30:54'),(4,'Світлові мачти','2026-03-10 20:31:14','2026-03-10 20:31:14');
/*!40000 ALTER TABLE `toolLists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UsageLiquidsLogs`
--

DROP TABLE IF EXISTS `UsageLiquidsLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UsageLiquidsLogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `volume` int NOT NULL,
  `date` date NOT NULL,
  `substance` varchar(255) NOT NULL,
  `eventType` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `brigadeId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `usageliquidslogs_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UsageLiquidsLogs`
--

LOCK TABLES `UsageLiquidsLogs` WRITE;
/*!40000 ALTER TABLE `UsageLiquidsLogs` DISABLE KEYS */;
INSERT INTO `UsageLiquidsLogs` VALUES (1,20,'2026-03-04','Піноутворювач','Навчання','23 дпрч',1,'2026-03-12 21:29:19','2026-03-12 21:29:19'),(2,103,'2026-03-28','Піноутворювач','Пожежа','промислова дорога',1,'2026-03-12 21:29:56','2026-03-12 21:29:56');
/*!40000 ALTER TABLE `UsageLiquidsLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` enum('RO','RW','GOD','SEMI-GOD') NOT NULL DEFAULT 'RW',
  `password` varchar(255) NOT NULL,
  `brigadeId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'afryca','GOD','$2b$10$RqDJ.j63hQXRzcoOUOvMNOuB60LIeoUbxob5tUkxCn33UgO3X0DAG',NULL,'2026-03-03 12:44:40','2026-03-03 12:44:40'),(2,'testuser','RW','$2b$10$/6jOHwwO94hd/Yqpqcjnt.G7JmM3LoUl49DH5JTDuHLlaIsbHUeqq',1,'2026-03-04 18:13:02','2026-03-04 18:13:02'),(3,'semiGOD','SEMI-GOD','$2b$10$QLayXS9bf1ewDV96xFgfeOeuhQqC02QwY/6VXgW2.HoYySsUKQ91u',1,'2026-03-15 08:19:58','2026-03-15 08:19:58');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WaterPumps`
--

DROP TABLE IF EXISTS `WaterPumps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WaterPumps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `yearOfPurchase` int NOT NULL,
  `powerOf` float NOT NULL,
  `brigadeId` int NOT NULL,
  `placeOfStorage` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `brigadeId` (`brigadeId`),
  CONSTRAINT `waterpumps_ibfk_1` FOREIGN KEY (`brigadeId`) REFERENCES `Brigades` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WaterPumps`
--

LOCK TABLES `WaterPumps` WRITE;
/*!40000 ALTER TABLE `WaterPumps` DISABLE KEYS */;
INSERT INTO `WaterPumps` VALUES (1,'cccc',1333,2313120,1,'На автомобілях зведеного загону','ascas','2026-03-15 08:31:00','2026-03-15 08:31:00');
/*!40000 ALTER TABLE `WaterPumps` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-16 20:51:45
