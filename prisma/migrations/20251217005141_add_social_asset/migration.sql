-- CreateTable
CREATE TABLE "SocialAsset" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "prompt" TEXT,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SocialAsset" ADD CONSTRAINT "SocialAsset_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
