import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'simulated_backend_2', 'workflows.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const workflowsData = JSON.parse(fileContent);
    
    return NextResponse.json(workflowsData);
  } catch (error) {
    console.error('Error reading workflows file:', error);
    // Return empty array if workflows.json doesn't exist in simulated_backend_2
    return NextResponse.json([]);
  }
}
