import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'simulated_backend_2', 'docs_info.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const docsData = JSON.parse(fileContent);
    
    return NextResponse.json(docsData);
  } catch (error) {
    console.error('Error reading docs info file:', error);
    return NextResponse.json({ error: 'Docs info not found' }, { status: 404 });
  }
}
