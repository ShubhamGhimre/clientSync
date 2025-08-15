-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "timezone" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "browserNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "webhookUrl" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeoutMinutes" INTEGER,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatbots" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "chatbots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."files" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatBotId" TEXT NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatrooms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatBotId" TEXT NOT NULL,

    CONSTRAINT "chatrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatRoomId" TEXT NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bot_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatBotId" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bot_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_subdomain_key" ON "public"."organizations"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "settings_organizationId_key" ON "public"."settings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "bot_access_userId_chatBotId_key" ON "public"."bot_access"("userId", "chatBotId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatbots" ADD CONSTRAINT "chatbots_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_chatBotId_fkey" FOREIGN KEY ("chatBotId") REFERENCES "public"."chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatrooms" ADD CONSTRAINT "chatrooms_chatBotId_fkey" FOREIGN KEY ("chatBotId") REFERENCES "public"."chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "public"."chatrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bot_access" ADD CONSTRAINT "bot_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bot_access" ADD CONSTRAINT "bot_access_chatBotId_fkey" FOREIGN KEY ("chatBotId") REFERENCES "public"."chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
