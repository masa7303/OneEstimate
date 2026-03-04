import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { deleteUser as deleteAuthUser } from "@/lib/auth/server";

export async function POST(_req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 認証プロバイダ側のユーザー削除
    const del = await deleteAuthUser(user.id);
    if (!del.ok) {
      const status = del.status ?? 502;
      return NextResponse.json(
        { error: del.error || "ユーザー削除に失敗しました" },
        { status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account delete error:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
