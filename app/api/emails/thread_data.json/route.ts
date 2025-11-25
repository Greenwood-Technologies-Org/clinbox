import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'simulated_backend_2', 'thread_data.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const threadData = JSON.parse(fileContent);
    
    return NextResponse.json(threadData);
  } catch (error) {
    console.error('Error reading thread data file:', error);
    return NextResponse.json({ error: 'Thread data not found' }, { status: 404 });
  }
}