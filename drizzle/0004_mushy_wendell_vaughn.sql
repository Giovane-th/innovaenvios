CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL DEFAULT 'In''Nova Envios',
	`cnpj` varchar(20),
	`address` varchar(255),
	`city` varchar(100),
	`state` varchar(2),
	`zip` varchar(10),
	`correiosContract` varchar(255),
	`correiosApiKey` varchar(255),
	`correiosUser` varchar(255),
	`correiosPassword` varchar(255),
	`primaryColor` varchar(7) DEFAULT '#0a7ea4',
	`secondaryColor` varchar(7) DEFAULT '#1abc9c',
	`logoUrl` text,
	`enableNotifications` int DEFAULT 1,
	`enableAutoBackup` int DEFAULT 1,
	`darkMode` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
