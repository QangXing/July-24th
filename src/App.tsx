import { RendererCanvas } from '@/components/RendererCanvas';
import { Controls } from '@/components/Controls';

export default function App() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <RendererCanvas />
      <Controls />
    </div>
  );
}
