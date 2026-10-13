import { redirect } from 'next/navigation';

export default async function PreinscripcionPage({
	params,
}: {
	params: Promise<{ cursoId: string }>;
}) {
	const { cursoId } = await params;
	redirect(`/cursos/${cursoId}#preinscripcion`);
}
