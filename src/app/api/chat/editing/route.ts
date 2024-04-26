
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/api/_base";
import { getModelByConversationRecordId } from "@/data/conversation";
import { ANONYMOUS_USER_EMAIL } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const requestBody = await req.json();
        const { conversationRecordId, msgIndex, originalPrompt, editedPrompt, originalCompletion, editedCompletion, contributorEmail } = requestBody;
        const model = await getModelByConversationRecordId(conversationRecordId);

        if (!model) {
            return NextResponse.json(
                { message: "No model founded!" },
                { status: 500 },
            );
        }

        let round = await db.rateEditing.findFirst({
            where: {
                conversationRecordId: conversationRecordId, msgIndex: msgIndex
            }
        });

        if (round) {
            await db.rateEditing.updateMany({
                where: {
                    conversationRecordId: conversationRecordId, msgIndex: msgIndex
                },
                data: { editedPrompt: editedPrompt, editedCompletion: editedCompletion },
            })
            return NextResponse.json(
                { message: "Prompt&Completion updated" },
                { status: 200 },
            );
        }
        else {
            if (contributorEmail) {
                await db.rateEditing.create({
                    data: {
                        conversationRecordId: conversationRecordId,
                        msgIndex: msgIndex,
                        contributorEmail: contributorEmail,
                        model: model,
                        originalPrompt: originalPrompt,
                        editedPrompt: editedPrompt,
                        promptEditedScore: 0,
                        originalCompletion: originalCompletion,
                        editedCompletion: editedCompletion,
                        completionEditedScore: 0,
                    },
                });
            }
            else {
                await db.rateEditing.create({
                    data: {
                        conversationRecordId: conversationRecordId,
                        msgIndex: msgIndex,
                        contributorEmail: ANONYMOUS_USER_EMAIL,
                        model: model,
                        originalPrompt: originalPrompt,
                        editedPrompt: editedPrompt,
                        promptEditedScore: 0,
                        originalCompletion: originalCompletion,
                        editedCompletion: editedCompletion,
                        completionEditedScore: 0,
                    },
                });
            }
            return NextResponse.json(
                { message: "Prompt&Completion Edited" },
                { status: 200 },
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to edit!" },
            { status: 500 },
        );
    } finally {
        // await db.$disconnect();
    }
}
