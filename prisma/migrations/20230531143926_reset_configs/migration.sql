-- CreateTable
CREATE TABLE "index" (
    "id" SERIAL NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,

    CONSTRAINT "index_pkey" PRIMARY KEY ("id")
);
