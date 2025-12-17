import { db } from "../src/db/prisma";

async function main() {
    const count = await db.socialPost.count();
    console.log(`SocialPost count: ${count}`);
    const posts = await db.socialPost.findMany();
    console.log(JSON.stringify(posts, null, 2));
}

main();
