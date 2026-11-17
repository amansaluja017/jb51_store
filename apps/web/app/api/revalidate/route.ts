import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag') || 'site-config';

  try {
    revalidateTag(tag);
    return NextResponse.json({
      revalidated: true,
      tag,
      now: Date.now(),
      message: `Tag "${tag}" revalidated successfully`,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Revalidation failed';
    return NextResponse.json(
      { revalidated: false, error },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag') || 'site-config';

  try {
    revalidateTag(tag);
    return NextResponse.json({
      revalidated: true,
      tag,
      now: Date.now(),
      message: `Tag "${tag}" revalidated successfully`,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Revalidation failed';
    return NextResponse.json(
      { revalidated: false, error },
      { status: 500 }
    );
  }
}
