import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = join(process.cwd(), 'simulated_backend', 'simulated_inbox', filename);
    const fileContent = await readFile(filePath, 'utf-8');
    const emailData = JSON.parse(fileContent);
    
    return NextResponse.json(emailData);
  } catch (error) {
    console.error('Error reading email file:', error);
    return NextResponse.json({ error: 'Email not found' }, { status: 404 });
  }
}
