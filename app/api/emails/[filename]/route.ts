import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = join(process.cwd(), 'simulated_backend_2', 'simulated_inbox', filename);
    const fileContent = await readFile(filePath, 'utf-8');
    const threadData = JSON.parse(fileContent);
    
    return NextResponse.json(threadData);
  } catch (error) {
    console.error('Error reading thread file:', error);
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }
}
