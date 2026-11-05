import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getMetrics } from '@/lib/metrics';
export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;
  try {
    return NextResponse.json(await getMetrics());
  } catch (error) {
    console.error('Error obteniendo metricas:', error);
    return NextResponse.json({ error: 'No se pudo cargar el dashboard' }, { status: 500 });
  }
}
