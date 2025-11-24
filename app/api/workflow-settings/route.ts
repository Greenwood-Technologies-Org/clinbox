import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'simulated_backend', 'workflow_settings.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const settingsData = JSON.parse(fileContent);
    
    return NextResponse.json(settingsData);
  } catch (error) {
    console.error('Error reading workflow settings file:', error);
    return NextResponse.json({ error: 'Workflow settings not found' }, { status: 404 });
  }
}
