import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'simulated_backend_2', 'thread_ai_analyses.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const threadAIAnalyses = JSON.parse(fileContent);
    
    return NextResponse.json(threadAIAnalyses);
  } catch (error) {
    console.error('Error reading thread AI analyses file:', error);
    return NextResponse.json({ error: 'Thread AI analyses not found' }, { status: 404 });
  }
}