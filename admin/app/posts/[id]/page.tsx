import { prisma } from '@/lib/prisma';
import { approvePost } from '@/app/actions';
import Link from 'next/link';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await prisma.socialPost.findUnique({
        where: { id },
        include: { assets: true }
    });

    if (!post) {
        return <div>Post not found</div>;
    }

    const imageAsset = post.assets.find(a => a.type === 'image');

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="mb-6 flex justify-between items-center">
                <Link href="/posts" className="text-sm text-gray-500 hover:underline">
                    &larr; Back to Posts
                </Link>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    post.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {post.status}
                </span>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {post.platform.toUpperCase()} Post
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        From {post.sourceUrl}
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <p className="whitespace-pre-wrap text-gray-800 text-lg">
                            {post.content}
                        </p>
                    </div>
                </div>
            </div>

            {imageAsset && (
                <div className="mb-8">
                    <h4 className="text-lg font-medium mb-3">Associated Image</h4>
                    <img
                        src={imageAsset.imageUrl}
                        alt={imageAsset.altText || "Social post image"}
                        className="w-full rounded border"
                    />
                </div>
            )}

            <div className="flex justify-end gap-4">
                {post.status === 'draft' && (
                    <form action={async () => {
                        'use server';
                        await approvePost(post.id);
                    }}>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Approve Post
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
