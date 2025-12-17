"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function approvePost(id: string) {
    try {
        await prisma.socialPost.update({
            where: { id },
            data: { status: "approved" },
        });
        revalidatePath("/posts");
        revalidatePath(`/posts/${id}`);
    } catch (error) {
        console.error("Failed to approve post:", error);
        throw new Error("Failed to approve post");
    }
}
