CREATE TABLE `game_participants` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`score` int DEFAULT 0,
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`leftAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` varchar(64) NOT NULL,
	`gameId` varchar(64) NOT NULL,
	`state` json NOT NULL,
	`winner` varchar(64),
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` varchar(64) NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`type` varchar(32) NOT NULL,
	`definition` json NOT NULL,
	`creatorId` int NOT NULL,
	`playerCount` int DEFAULT 1,
	`maxPlayers` int DEFAULT 1,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
