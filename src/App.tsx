import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import {
  Search, Wrench, Thermometer, Zap, AlertTriangle, ChevronRight, ChevronUp, ChevronDown,
  CheckSquare, Square, ArrowLeft, PenTool as Tool,
  Mail, Lock, User, LogOut, Plus, Trash2, Monitor, Laptop,
  Check, Edit2, X, Key, Shield, Bookmark, BookmarkPlus,
  Send, Star, Image,
  FileText, Upload, Info, CheckCircle2, AlertCircle, Award, WifiOff, Clock, ServerCrash, LogIn,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | 'login' | 'login-admin' | 'register' | 'register-admin'
  | 'admin-dash' | 'user-dash'
  | 'task-select' | 'prep' | 'tutorial'
  | 'admin-task-select' | 'admin-prep' | 'admin-tutorial'
  | 'tech-profile';

type Role = 'admin' | 'superadmin' | 'user';
type DeviceType = 'laptop' | 'pc';
type AlertKind = 'warning' | 'danger' | 'info';

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  image: string;
  adminId: string;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  image: string;
  hasAlert: boolean;
  alertText: string;
  alertType: AlertKind;
  alertConfirmText: string;
}

interface Guide {
  id: string;
  deviceId: string;
  title: string;
  level: 'Bajo' | 'Medio' | 'Alto';
  image: string;
  adminId: string;
  tools: string[];
  steps: GuideStep[];
}

// ─── Constants & Seed Data ────────────────────────────────────────────────────

const CURRENT_ADMIN_ID = 'admin-current';
const OTHER_ADMIN_ID = 'admin-other';
const SUPER_CODE = 'SA-9999';

const ADMIN_NAMES: Record<string, string> = {
  [CURRENT_ADMIN_ID]: 'Carlos M.',
  [OTHER_ADMIN_ID]: 'Ana R.',
};

const stepsRam: GuideStep[] = [
  {
    id: 'r1',
    title: 'Apaga el equipo y desconecta la batería',
    description: 'Asegúrate de apagar el equipo completamente. Luego abre la tapa trasera y jala suavemente el cable de la batería para desconectarlo.',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=600&fit=crop&auto=format',
    hasAlert: true,
    alertType: 'danger',
    alertText: 'No toques ninguna pieza sin antes desconectar la batería. Podrías dañar el equipo o lastimarte.',
    alertConfirmText: 'Batería desconectada',
  },
  {
    id: 'r2',
    title: 'Ubica los ranuras de memoria',
    description: 'Busca los módulos de RAM dentro del equipo. Son piezas rectangulares verdes con ranuras a los lados. Empuja las pestañas hacia afuera para soltarlos.',
    image: 'https://images.unsplash.com/photo-1562976540-1502f759221a?w=800&h=600&fit=crop&auto=format',
    hasAlert: false,
    alertType: 'warning',
    alertText: '',
    alertConfirmText: '',
  },
  {
    id: 'r3',
    title: 'Instala la nueva memoria o SSD',
    description: 'Inserta el módulo nuevo inclinado 45° y luego presiónalo hasta escuchar un clic. Asegúrate de que quede bien fijo antes de cerrar el equipo.',
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&h=600&fit=crop&auto=format',
    hasAlert: true,
    alertType: 'warning',
    alertText: 'Manipula la memoria tomándola por los bordes. No toques los contactos dorados con los dedos.',
    alertConfirmText: '',
  },
];

const stepsBattery: GuideStep[] = [
  {
    id: 'b1',
    title: 'Retira los tornillos de la tapa',
    description: 'Voltea el equipo y quita los tornillos de la tapa inferior con el destornillador. Guárdalos en un lugar seguro para no perderlos.',
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&h=600&fit=crop&auto=format',
    hasAlert: false,
    alertType: 'warning',
    alertText: '',
    alertConfirmText: '',
  },
  {
    id: 'b2',
    title: 'Abre la tapa con la púa',
    description: 'Desliza la púa por el borde del equipo para separar la tapa. Ve despacio para no quebrar los ganchos de plástico.',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=600&fit=crop&auto=format',
    hasAlert: true,
    alertType: 'info',
    alertText: 'Si sientes mucha resistencia en algún punto, revisa que no falte quitar algún tornillo antes de forzar.',
    alertConfirmText: '',
  },
  {
    id: 'b3',
    title: 'Cambia la batería',
    description: 'Desconecta el cable de la batería vieja y sácala. Coloca la batería nueva, conecta el cable y vuelve a cerrar la tapa.',
    image: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=800&h=600&fit=crop&auto=format',
    hasAlert: false,
    alertType: 'warning',
    alertText: '',
    alertConfirmText: '',
  },
];

const stepsCleaning: GuideStep[] = [
  {
    id: 'c1',
    title: 'Abre el equipo y desconecta la batería',
    description: 'Quita los tornillos, abre la tapa y desconecta la batería antes de tocar cualquier pieza interna.',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=600&fit=crop&auto=format',
    hasAlert: true,
    alertType: 'danger',
    alertText: 'No uses el compresor cerca de los ojos y mantén el equipo sobre una superficie firme.',
    alertConfirmText: 'Batería desconectada',
  },
  {
    id: 'c2',
    title: 'Sopla el polvo del ventilador',
    description: 'Con el compresor de aire, sopla el ventilador y los conductos de ventilación en ráfagas cortas. Aleja el polvo del equipo.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&auto=format',
    hasAlert: false,
    alertType: 'warning',
    alertText: '',
    alertConfirmText: '',
  },
  {
    id: 'c3',
    title: 'Cambia la pasta térmica',
    description: 'Con un hisopo con alcohol, limpia la pasta vieja del procesador. Aplica una pequeña gota de pasta nueva en el centro y vuelve a colocar el disipador.',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&h=600&fit=crop&auto=format',
    hasAlert: true,
    alertType: 'warning',
    alertText: 'No apliques demasiada pasta. Una gota del tamaño de un grano de arroz es suficiente.',
    alertConfirmText: '',
  },
];

const initialDevices: Device[] = [
  {
    id: '1', name: 'Lenovo LOQ', model: '15IRH8', type: 'laptop',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop&auto=format',
    adminId: CURRENT_ADMIN_ID,
  },
  {
    id: '2', name: 'Corsair One', model: 'i300', type: 'pc',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop&auto=format',
    adminId: CURRENT_ADMIN_ID,
  },
  // Mismo modelo y tipo que 'Lenovo LOQ 15IRH8' pero registrado por otro técnico
  {
    id: '3', name: 'Lenovo LOQ', model: '15IRH8', type: 'laptop',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop&auto=format',
    adminId: OTHER_ADMIN_ID,
  },
  {
    id: '4', name: 'Corsair One', model: 'i300', type: 'pc',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop&auto=format',
    adminId: OTHER_ADMIN_ID,
  },
];

const initialGuides: Guide[] = [
  {
    id: '1', deviceId: '1', title: 'Mejorar RAM o SSD', level: 'Medio',
    image: 'https://images.unsplash.com/photo-1562976540-1502f759221a?w=400&h=300&fit=crop&auto=format',
    adminId: CURRENT_ADMIN_ID,
    tools: ['Destornillador Phillips #0', 'Pulsera antiestática', 'Púa de apertura'],
    steps: stepsRam,
  },
  {
    id: '2', deviceId: '3', title: 'Cambiar Batería', level: 'Bajo',
    image: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&h=300&fit=crop&auto=format',
    adminId: OTHER_ADMIN_ID,
    tools: ['Destornillador Phillips #0', 'Púa de apertura'],
    steps: stepsBattery,
  },
  {
    id: '3', deviceId: '2', title: 'Limpieza Profunda', level: 'Alto',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&auto=format',
    adminId: CURRENT_ADMIN_ID,
    tools: ['Destornillador Phillips #0', 'Pasta térmica', 'Alcohol isopropílico', 'Compresor de aire'],
    steps: stepsCleaning,
  },
  {
    id: '4', deviceId: '4', title: 'Revisión de GPU y Ventiladores', level: 'Medio',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop&auto=format',
    adminId: OTHER_ADMIN_ID,
    tools: ['Destornillador Phillips #0', 'Compresor de aire', 'Pulsera antiestática'],
    steps: [
      {
        id: 'g1',
        title: 'Retira la tapa lateral del gabinete',
        description: 'Desatornilla los dos tornillos de la tapa lateral y deslízala hacia atrás para abrirla. Coloca el gabinete sobre una superficie estable.',
        image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=600&fit=crop&auto=format',
        hasAlert: true,
        alertType: 'warning',
        alertText: 'Antes de abrir el gabinete, asegúrate de haber desconectado el cable de corriente completamente.',
        alertConfirmText: 'Cable desconectado',
      },
      {
        id: 'g2',
        title: 'Limpia los ventiladores con aire comprimido',
        description: 'Sostén las aspas del ventilador con un dedo para que no giren. Sopla en ráfagas cortas para expulsar el polvo acumulado sin dañar los rodamientos.',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop&auto=format',
        hasAlert: false,
        alertType: 'info',
        alertText: '',
        alertConfirmText: '',
      },
      {
        id: 'g3',
        title: 'Verifica que la GPU esté bien encajada',
        description: 'Empuja suavemente la tarjeta gráfica hacia abajo hasta escuchar el clic del seguro del slot PCIe. Reconecta los cables de alimentación de la GPU.',
        image: 'https://images.unsplash.com/photo-1562976540-1502f759221a?w=800&h=600&fit=crop&auto=format',
        hasAlert: true,
        alertType: 'info',
        alertText: 'Si la GPU no hace clic al encajar, no la fuerces. Revisa que el slot esté libre de obstrucciones.',
        alertConfirmText: '',
      },
    ],
  },
];

interface Certificate {
  id: string;
  title: string;
  institution: string;
  fileName: string;
}

const initialCertificates: Record<string, Certificate[]> = {
  [CURRENT_ADMIN_ID]: [
    { id: 'c1', title: 'Mantenimiento de equipos', institution: 'Instituto TecnoSur', fileName: 'mantenimiento.pdf' },
  ],
  [OTHER_ADMIN_ID]: [],
};

// ─── Toasts ───────────────────────────────────────────────────────────────────

type ToastKind = 'success' | 'error' | 'warning' | 'info';
interface ToastData {
  id: number; kind: ToastKind; title: string; message?: string;
  actionLabel?: string; onAction?: () => void;
  persistent?: boolean; // banner que no se cierra solo
  primary?: boolean; // botón de acción principal (azul)
  icon?: React.ElementType;
  key?: string; // reemplaza otro aviso con la misma clave
}
type Notify = (t: Omit<ToastData, 'id'>) => void;
const ToastContext = createContext<Notify>(() => {});
const useNotify = () => useContext(ToastContext);

const TOAST_STYLES: Record<ToastKind, { icon: React.ElementType; color: string }> = {
  success: { icon: CheckCircle2, color: 'text-emerald-400' },
  error: { icon: AlertCircle, color: 'text-orange-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  info: { icon: Info, color: 'text-primary' },
};

function ToastHost({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: number) => void }) {
  return (
    <div className="absolute top-3 inset-x-3 z-50 space-y-2 pointer-events-none">
      {toasts.map(t => {
        const { icon: DefaultIcon, color } = TOAST_STYLES[t.kind];
        const Icon = t.icon ?? DefaultIcon;
        return (
          <div key={t.id} className="pointer-events-auto bg-muted border rounded-2xl p-3.5 flex items-start gap-3 shadow-xl shadow-black/40">
            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', color)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.message && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.message}</p>}
              {t.actionLabel && (
                <button onClick={() => { onDismiss(t.id); t.onAction?.(); }} className={cn('mt-2 px-4 py-2 rounded-full text-xs font-semibold', t.primary ? 'bg-primary text-primary-foreground active:opacity-80' : 'bg-card border active:bg-background')}>
                  {t.actionLabel}
                </button>
              )}
            </div>
            <button onClick={() => onDismiss(t.id)} className="p-1 -mr-1 text-muted-foreground" aria-label="Cerrar"><X className="w-4 h-4" /></button>
          </div>
        );
      })}
    </div>
  );
}

function ConfirmDialog({ title, subject, message, onCancel, onConfirm }: {
  title: string; subject: string; message: string; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70">
      <div className="w-full max-w-[350px] bg-muted border rounded-3xl p-5">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-orange-400" />
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm font-semibold mt-2">{subject}</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{message}</p>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="px-5 py-2.5 bg-card border rounded-full text-sm font-semibold active:bg-background">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 bg-orange-500 text-black rounded-full text-sm font-bold active:bg-orange-600">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-orange-400 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {children}
    </p>
  );
}

// ─── Loading (procesos largos) ───────────────────────────────────────────────────────────────────

function FixTechLogo({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 124 124" fill="none" aria-label="FixTech" className="drop-shadow-[0_0_28px_rgba(59,130,246,0.45)]">
      <rect width="124" height="124" rx="30" className="fill-primary" />
      {/* laptop */}
      <rect x="17" y="24" width="90" height="62" rx="8" fill="#fff" />
      <rect x="23" y="30" width="78" height="50" rx="4" fill="#0f172a" />
      <rect x="16" y="91" width="92" height="9" rx="4.5" fill="#fff" />
      <rect x="54" y="87" width="16" height="4" rx="2" fill="#cbd5e1" />
      {/* play */}
      <circle cx="46" cy="55" r="14" className="fill-primary" />
      <path d="M42 48.5 L54 55 L42 61.5 Z" fill="#fff" />
      {/* screwdriver */}
      <g transform="rotate(35 80 56)">
        <rect x="74" y="26" width="12" height="26" rx="6" fill="#fff" />
        <rect x="74" y="35" width="12" height="3" className="fill-primary" />
        <rect x="74" y="41" width="12" height="3" className="fill-primary" />
        <rect x="79" y="52" width="2.5" height="22" rx="1.2" fill="#fff" />
      </g>
    </svg>
  );
}

function SplashView() {
  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center relative bg-[#0f172a] overflow-hidden animate-in fade-in">
      <div className="absolute top-[22%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative flex flex-col items-center">
        <FixTechLogo size={124} />
        <h1 className="text-[34px] font-extrabold mt-8 tracking-tight">Fix<span className="text-primary">Tech</span></h1>
      </div>
      <p className="absolute bottom-10 text-xs text-muted-foreground flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Mantenimiento tecnológico, paso a paso
      </p>
    </div>
  );
}

function LoadingOverlay({ title, message }: { title: string; message: string }) {
  return (
    <div className="absolute inset-0 z-[60] bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center px-8 text-center" role="status" aria-live="polite">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="absolute inset-0 animate-spin" style={{ animationDuration: '1.4s' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/20" />
          <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="90 210" className="text-primary" />
        </svg>
        <FixTechLogo size={56} />
      </div>
      <h2 className="text-lg font-bold mt-6">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{message}</p>
      <p className="text-xs text-muted-foreground/70 mt-6">Con una conexión lenta esto puede tardar unos segundos. No cierres la app.</p>
    </div>
  );
}

type NetMode = 'ok' | 'offline' | 'down' | 'timeout' | 'expired' | 'error';
type TaskOpts = { title: string; message: string; failTitle?: string; failMessage?: string; retryLabel?: string };
type RunTask = (opts: TaskOpts, action: () => void) => void;
const LoadingContext = createContext<RunTask>((_, action) => action());
const useRunTask = () => useContext(LoadingContext);

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [splash, setSplash] = useState(true);
  useEffect(() => { const t = setTimeout(() => setSplash(false), 2000); return () => clearTimeout(t); }, []);
  const [loading, setLoading] = useState<{ title: string; message: string } | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastId = useRef(0);
  const dismissToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const notify: Notify = useCallback((t) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev.filter(x => !t.key || x.key !== t.key), { ...t, id }]);
    if (!t.persistent) setTimeout(() => dismissToast(id), t.actionLabel ? 7000 : 3500);
  }, [dismissToast]);
  const [certificates, setCertificates] = useState<Record<string, Certificate[]>>(initialCertificates);
  const [techProfileId, setTechProfileId] = useState<string>(CURRENT_ADMIN_ID);
  const [techProfileBack, setTechProfileBack] = useState<View>('task-select');
  const [currentView, setCurrentView] = useState<View>('login');
  const [role, setRole] = useState<Role>('user');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [guides, setGuides] = useState<Guide[]>(initialGuides);
  const [savedDeviceIds, setSavedDeviceIds] = useState<string[]>(['1']);
  const [pinnedGuideIds, setPinnedGuideIds] = useState<string[]>(['1']);
  const [notificationsOn, setNotificationsOn] = useState(true);
  // Estado de red: real (navigator.onLine) o simulado desde el panel Sistema
  const [netMode, setNetMode] = useState<NetMode>('ok');
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const effectiveMode: NetMode = !online ? 'offline' : netMode;
  const modeRef = useRef<NetMode>('ok');
  modeRef.current = effectiveMode;
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const runTask: RunTask = useCallback((opts, action) => {
    const attempt = () => {
      setLoading(opts);
      // Simula la espera de red; al terminar se ejecuta la acción real o se muestra el fallo
      setTimeout(() => {
        setLoading(null);
        const mode = modeRef.current;
        if (mode === 'ok') { setToasts(prev => prev.filter(x => x.key !== 'sys' && x.key !== 'op')); action(); return; }
        const retry = () => attempt();
        if (mode === 'offline') notify({ key: 'sys', persistent: true, kind: 'error', icon: WifiOff, title: 'Sin conexión', message: 'No pudimos enviar la solicitud. Comprueba tu conexión a Internet y vuelve a intentarlo.', actionLabel: 'Reintentar', onAction: retry });
        else if (mode === 'down') notify({ key: 'sys', persistent: true, kind: 'error', icon: ServerCrash, title: 'Servicio no disponible', message: 'FixTech no está disponible temporalmente. No pudimos completar la solicitud. Inténtalo de nuevo en unos minutos.', actionLabel: 'Reintentar', onAction: retry });
        else if (mode === 'timeout') notify({ key: 'sys', persistent: true, kind: 'warning', icon: Clock, title: 'La solicitud tardó demasiado', message: 'No pudimos confirmar el resultado. Comprueba si el cambio se aplicó antes de repetir la operación para evitar duplicados.', actionLabel: 'Comprobar estado', onAction: () => {
          if (modeRef.current === 'ok') notify({ kind: 'info', title: 'Estado comprobado', message: 'El cambio no se aplicó. Puedes intentarlo de nuevo sin riesgo de duplicados.' });
          else notify({ key: 'sys', persistent: true, kind: 'warning', icon: Clock, title: 'Aún sin respuesta', message: 'El servidor todavía no confirma la operación. Inténtalo de nuevo en un momento.' });
        } });
        else if (mode === 'expired') notify({ key: 'sys', persistent: true, kind: 'info', icon: LogIn, title: 'Tu sesión ha caducado', message: 'Vuelve a iniciar sesión para continuar usando tu cuenta de FixTech.', actionLabel: 'Volver a iniciar sesión', primary: true, onAction: () => { setNetMode('ok'); setToasts([]); setCurrentView('login'); } });
        else notify({ key: 'op', persistent: true, kind: 'error', title: opts.failTitle ?? 'No se pudo completar la operación', message: opts.failMessage, actionLabel: opts.retryLabel ?? 'Reintentar', onAction: retry });
      }, 2200);
    };
    attempt();
  }, [notify]);

  const handleLogin = (r: Role, name: string, email: string) => {
    setRole(r);
    setUserName(name || (r === 'superadmin' ? 'Super Admin' : r === 'admin' ? 'Administrador' : 'Usuario'));
    setUserEmail(email);
    setCurrentView(r === 'user' ? 'user-dash' : 'admin-dash');
  };

  const handleLogout = () => setCurrentView('login');

  const toggleSaveDevice = (id: string) =>
    setSavedDeviceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const togglePinGuide = (id: string) =>
    setPinnedGuideIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <ToastContext.Provider value={notify}>
    <LoadingContext.Provider value={runTask}>
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-primary-foreground flex justify-center">
      <div className="w-full max-w-[390px] bg-card min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        <ToastHost toasts={toasts} onDismiss={dismissToast} />
        {splash && <SplashView />}
        {!splash && <>
        {loading && <LoadingOverlay title={loading.title} message={loading.message} />}

        {currentView === 'login' && <AuthView type="login" onAuth={handleLogin} onSwitchToRegister={() => setCurrentView('register')} onSwitchToAdmin={() => setCurrentView('login-admin')} />}
        {currentView === 'login-admin' && <AuthView type="login-admin" onAuth={handleLogin} onSwitchToRegister={() => setCurrentView('register-admin')} onSwitchToAdmin={() => setCurrentView('login')} />}
        {currentView === 'register' && <AuthView type="register" onAuth={handleLogin} onSwitchToRegister={() => setCurrentView('login')} onSwitchToAdmin={() => setCurrentView('register-admin')} />}
        {currentView === 'register-admin' && <AuthView type="register-admin" onAuth={handleLogin} onSwitchToRegister={() => setCurrentView('login-admin')} onSwitchToAdmin={() => setCurrentView('login')} />}

        {currentView === 'admin-dash' && (
          <AdminDashboardView
            role={role} userName={userName} userEmail={userEmail}
            notificationsOn={notificationsOn} onToggleNotifications={() => setNotificationsOn(v => !v)}
            devices={devices} setDevices={setDevices}
            guides={guides} setGuides={setGuides}
            certificates={certificates[CURRENT_ADMIN_ID] ?? []}
            onAddCertificate={(c) => setCertificates(prev => ({ ...prev, [CURRENT_ADMIN_ID]: [...(prev[CURRENT_ADMIN_ID] ?? []), c] }))}
            onRemoveCertificate={(id) => setCertificates(prev => ({ ...prev, [CURRENT_ADMIN_ID]: (prev[CURRENT_ADMIN_ID] ?? []).filter(c => c.id !== id) }))}
            netMode={netMode} onChangeNetMode={setNetMode}
            onLogout={handleLogout}
            onSelectDeviceForGuides={(device) => { setSelectedDevice(device); setCurrentView('admin-task-select'); }}
          />
        )}

        {currentView === 'user-dash' && (
          <UserDashboardView
            devices={devices} guides={guides}
            userName={userName} userEmail={userEmail}
            savedDeviceIds={savedDeviceIds}
            pinnedGuideIds={pinnedGuideIds}
            notificationsOn={notificationsOn} onToggleNotifications={() => setNotificationsOn(v => !v)}
            onToggleSave={toggleSaveDevice}
            onLogout={handleLogout}
            onSelectDevice={(device) => { setSelectedDevice(device); setCurrentView('task-select'); }}
          />
        )}

        {currentView === 'task-select' && selectedDevice && (
          <TaskSelectionView
            device={selectedDevice}
            guides={guides.filter(g => g.deviceId === selectedDevice.id)}
            pinnedGuideIds={pinnedGuideIds}
            onTogglePin={togglePinGuide}
            onViewTech={(id) => { setTechProfileId(id); setTechProfileBack('task-select'); setCurrentView('tech-profile'); }}
            onBack={() => setCurrentView('user-dash')}
            onSelect={(guide) => { setSelectedGuide(guide); setCurrentView('prep'); }}
          />
        )}

        {currentView === 'prep' && selectedGuide && (
          <PreparationView guide={selectedGuide} onBack={() => setCurrentView('task-select')} onNext={() => setCurrentView('tutorial')} />
        )}
        {currentView === 'tutorial' && selectedGuide && (
          <TutorialView guide={selectedGuide} onBack={() => setCurrentView('prep')} onComplete={() => setCurrentView('user-dash')} />
        )}

        {/* Admin guide preview — same flow as user */}
        {currentView === 'admin-task-select' && selectedDevice && (
          <TaskSelectionView
            device={selectedDevice}
            guides={guides.filter(g => g.deviceId === selectedDevice.id)}
            pinnedGuideIds={[]}
            onTogglePin={() => {}}
            onViewTech={(id) => { setTechProfileId(id); setTechProfileBack('admin-task-select'); setCurrentView('tech-profile'); }}
            onBack={() => setCurrentView('admin-dash')}
            onSelect={(guide) => { setSelectedGuide(guide); setCurrentView('admin-prep'); }}
          />
        )}
        {currentView === 'admin-prep' && selectedGuide && (
          <PreparationView guide={selectedGuide} onBack={() => setCurrentView('admin-task-select')} onNext={() => setCurrentView('admin-tutorial')} />
        )}
        {currentView === 'admin-tutorial' && selectedGuide && (
          <TutorialView guide={selectedGuide} onBack={() => setCurrentView('admin-prep')} onComplete={() => setCurrentView('admin-dash')} />
        )}

        {currentView === 'tech-profile' && (
          <TechnicianProfileView
            adminId={techProfileId}
            devices={devices} guides={guides}
            certificates={certificates[techProfileId] ?? []}
            onBack={() => setCurrentView(techProfileBack)}
            onSelectGuide={(guide) => {
              setSelectedGuide(guide);
              setCurrentView(techProfileBack === 'admin-task-select' ? 'admin-prep' : 'prep');
            }}
          />
        )}
        </>}
      </div>
    </div>
    </LoadingContext.Provider>
    </ToastContext.Provider>
  );
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

function TopBar({ title, onBack, onLogout, badge }: {
  title: string;
  onBack?: () => void;
  onLogout?: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md border-b px-4 pb-4 pt-[max(env(safe-area-inset-top),1.5rem)] flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-muted" aria-label="Volver">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <h1 className="font-semibold text-lg tracking-tight flex-1 truncate">{title}</h1>
      {badge}
      {onLogout && (
        <button onClick={onLogout} className="p-2 -mr-2 rounded-full active:bg-muted text-muted-foreground" aria-label="Cerrar sesión">
          <LogOut className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function LabeledField({ label, hint, required: req, children }: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {req && <span className="text-xs text-destructive font-medium">*</span>}
        </div>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function LevelDot({ level }: { level: Guide['level'] }) {
  const colors: Record<Guide['level'], string> = { Bajo: 'bg-emerald-500', Medio: 'bg-amber-500', Alto: 'bg-red-500' };
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors[level])} />
      <span className="text-xs text-muted-foreground">Nivel {level}</span>
    </div>
  );
}

function AlertBlock({ alertType, alertText, confirmText, confirmed, onConfirm }: {
  alertType: AlertKind;
  alertText: string;
  confirmText: string;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  const styles: Record<AlertKind, { bg: string; icon: string; title: string; body: string }> = {
    danger: { bg: 'bg-orange-950/30 border-orange-800', icon: 'text-orange-400', title: 'Precaución', body: 'text-orange-200/80' },
    warning: { bg: 'bg-yellow-950/30 border-yellow-800', icon: 'text-yellow-400', title: 'Advertencia', body: 'text-yellow-200/70' },
    info: { bg: 'bg-blue-950/30 border-blue-900', icon: 'text-blue-400', title: 'Nota', body: 'text-blue-200/80' },
  };
  const s = styles[alertType];
  return (
    <div className={cn('p-5 rounded-2xl border flex gap-4 transition-colors items-start', confirmed ? 'bg-muted/50 border-border' : s.bg)}>
      <AlertTriangle className={cn('w-6 h-6 flex-shrink-0 mt-0.5', confirmed ? 'text-muted-foreground' : s.icon)} />
      <div className="space-y-4 flex-1">
        <div>
          <h3 className={cn('font-semibold', confirmed ? 'text-muted-foreground' : s.icon)}>{s.title}</h3>
          <p className={cn('text-sm mt-1 leading-snug', confirmed ? 'text-muted-foreground' : s.body)}>{alertText}</p>
        </div>
        {confirmText && (
          <button onClick={onConfirm} className="flex items-center gap-3 text-sm font-semibold select-none bg-card p-3 rounded-xl border w-full active:scale-[0.98] transition-transform">
            {confirmed ? <CheckSquare className="w-6 h-6 text-primary" /> : <Square className="w-6 h-6 text-muted-foreground" />}
            <span className={cn(confirmed ? 'text-foreground' : 'text-muted-foreground')}>{confirmText}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Auth View ────────────────────────────────────────────────────────────────

function AuthView({ type, onAuth, onSwitchToRegister, onSwitchToAdmin }: {
  type: 'login' | 'login-admin' | 'register' | 'register-admin';
  onAuth: (role: Role, name: string, email: string) => void;
  onSwitchToRegister: () => void;
  onSwitchToAdmin: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [name, setName] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const isAdminView = type === 'login-admin' || type === 'register-admin';
  const isRegister = type === 'register' || type === 'register-admin';
  const showCodeField = type === 'register-admin';

  const handleSubmit = () => {
    if (type === 'register-admin' && adminCode === SUPER_CODE && !email.trim()) {
      // Code only, no email → silent super admin entry
      onAuth('superadmin', 'Super Admin', '');
      return;
    }
    if (!email) return;
    if (isAdminView) {
      onAuth('admin', name || 'Administrador', email);
    } else {
      onAuth('user', name, email);
    }
  };

  const handleSendCode = () => {
    if (!email) return;
    setCodeSent(true);
    setTimeout(() => setCodeSent(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col pt-[max(env(safe-area-inset-top),1.5rem)] px-6 pb-6 bg-secondary/30 overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center py-10">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30 mx-auto">
          {isAdminView ? <Shield className="w-8 h-8 text-primary-foreground" /> : <Wrench className="w-8 h-8 text-primary-foreground" />}
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          {type === 'login' ? 'Bienvenido a FixTech'
            : type === 'register' ? 'Crea tu cuenta en FixTech'
            : type === 'login-admin' ? 'FixTech Técnico'
            : 'Registro de Técnico FixTech'}
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          {type === 'login' ? 'Ingresa tus datos para continuar'
            : type === 'register' ? 'Regístrate para ver guías de mantenimiento'
            : type === 'login-admin' ? 'Ingresa tus credenciales de administrador'
            : 'Crea tu cuenta de técnico autorizado'}
        </p>

        <div className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-card border rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-card border rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>

          {showCodeField && (
            <>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Código de confirmación de correo"
                    value={adminCode}
                    onChange={e => setAdminCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-card border rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <button onClick={handleSendCode} className="bg-secondary text-secondary-foreground px-4 rounded-2xl border font-semibold active:scale-[0.98] flex items-center justify-center min-w-[3rem]" title="Enviar código al correo">
                  {codeSent ? <Check className="w-5 h-5 text-emerald-500" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              {codeSent && <p className="text-emerald-500 text-xs font-medium text-center">¡Código enviado a tu correo!</p>}
            </>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-card border rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>

          <button onClick={handleSubmit} className="w-full mt-4 bg-primary text-primary-foreground py-4 rounded-2xl font-semibold shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform">
            {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={onSwitchToRegister} className="text-sm text-muted-foreground font-medium active:text-primary">
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
          <button onClick={onSwitchToAdmin} className="text-xs text-muted-foreground/50 font-medium active:text-primary mt-8 flex items-center gap-1">
            {isAdminView ? <User className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
            {isAdminView ? 'Volver a acceso de Usuario' : 'Acceso Técnico (Administrador)'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboardView({ role, userName, userEmail, notificationsOn, onToggleNotifications, devices, setDevices, guides, setGuides, certificates, onAddCertificate, onRemoveCertificate, netMode, onChangeNetMode, onLogout, onSelectDeviceForGuides }: {
  role: Role;
  userName: string;
  userEmail: string;
  notificationsOn: boolean;
  onToggleNotifications: () => void;
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  guides: Guide[];
  setGuides: React.Dispatch<React.SetStateAction<Guide[]>>;
  certificates: Certificate[];
  onAddCertificate: (c: Certificate) => void;
  onRemoveCertificate: (id: string) => void;
  netMode: NetMode;
  onChangeNetMode: (m: NetMode) => void;
  onLogout: () => void;
  onSelectDeviceForGuides: (device: Device) => void;
}) {
  type AdminTab = 'mis-equipos' | 'guias' | 'sistema' | 'perfil';
  const [tab, setTab] = useState<AdminTab>('mis-equipos');
  const [editingDevice, setEditingDevice] = useState<Partial<Device> | null>(null);
  const [editingGuide, setEditingGuide] = useState<Partial<Guide> | null>(null);
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'device' | 'guide'; id: string } | null>(null);
  const [certsOpen, setCertsOpen] = useState(false);
  const [certNoticeHidden, setCertNoticeHidden] = useState(false);
  const notify = useNotify();
  const runTask = useRunTask();

  const myDevices = role === 'superadmin' ? devices : devices.filter(d => d.adminId === CURRENT_ADMIN_ID);

  // Un técnico no puede tener dos veces el mismo modelo y tipo; distintos técnicos sí pueden.
  const isDuplicateDevice = (device: Partial<Device>) => {
    const norm = (v?: string) => (v || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const owner = role === 'superadmin' && device.id ? devices.find(d => d.id === device.id)?.adminId : CURRENT_ADMIN_ID;
    return devices.some(d =>
      d.id !== device.id && d.adminId === owner &&
      norm(d.model) === norm(device.model) && d.type === (device.type || 'laptop')
    );
  };

  const saveDevice = (device: Partial<Device>) => {
    if (isDuplicateDevice(device)) return;
    runTask(
      device.id
        ? { title: 'Guardando cambios...', message: 'Estamos actualizando la información del equipo.', failTitle: 'No se guardaron los cambios', failMessage: `La edición de ${device.name} ${device.model} no se completó. Revisa la información e intenta guardar de nuevo.`, retryLabel: 'Reintentar guardado' }
        : { title: 'Creando dispositivo...', message: 'Estamos agregando el equipo a tus dispositivos.', failTitle: 'No se pudo crear el dispositivo', failMessage: `${device.name} ${device.model} no se agregó a tus equipos. Comprueba tu conexión y vuelve a intentarlo.`, retryLabel: 'Reintentar' },
      () => commitDevice(device)
    );
  };

  const commitDevice = (device: Partial<Device>) => {
    if (device.id) {
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, ...device } as Device : d));
      notify({ kind: 'success', title: 'Cambios guardados', message: `La información de ${device.name} se actualizó correctamente.` });
    } else {
      notify({ kind: 'success', title: 'Dispositivo creado', message: `${device.name} ${device.model} se agregó a tus equipos.` });
      setDevices(prev => [...prev, {
        id: Date.now().toString(),
        name: device.name || '',
        model: device.model || '',
        type: device.type || 'laptop',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&auto=format',
        adminId: CURRENT_ADMIN_ID,
      }]);
    }
    setEditingDevice(null);
  };

  const deleteDevice = (id: string) => {
    const d = devices.find(x => x.id === id);
    if (!d) return;
    runTask(
      { title: 'Eliminando dispositivo...', message: 'Estamos quitando el equipo y sus guías.', failTitle: 'No se eliminó el dispositivo', failMessage: `${d.name} ${d.model} sigue en tus equipos. Comprueba tu conexión e intenta eliminarlo de nuevo.`, retryLabel: 'Reintentar eliminación' },
      () => commitDeleteDevice(id)
    );
  };

  const commitDeleteDevice = (id: string) => {
    const d = devices.find(x => x.id === id);
    if (d) notify({ kind: 'success', title: 'Dispositivo eliminado', message: `${d.name} ${d.model} se eliminó de tus equipos.` });
    setDevices(prev => prev.filter(d => d.id !== id));
    setGuides(prev => prev.filter(g => g.deviceId !== id));
  };

  const saveGuide = (guide: Partial<Guide>, steps: GuideStep[], tools: string[]) => {
    runTask(
      guide.id
        ? { title: 'Guardando cambios...', message: 'Estamos actualizando tu guía y sus pasos.', failTitle: 'No se guardaron los cambios', failMessage: `La edición de «${guide.title}» no se completó. Revisa la información e intenta guardar de nuevo.`, retryLabel: 'Reintentar guardado' }
        : { title: 'Publicando guía...', message: 'Estamos subiendo los pasos, herramientas e imágenes de tu guía.', failTitle: 'No se pudo publicar la guía', failMessage: `«${guide.title}» no se guardó ni se publicó. Comprueba tu conexión e intenta guardar de nuevo.`, retryLabel: 'Reintentar publicación' },
      () => commitGuide(guide, steps, tools)
    );
  };

  const commitGuide = (guide: Partial<Guide>, steps: GuideStep[], tools: string[]) => {
    const dev = devices.find(d => d.id === guide.deviceId);
    notify(guide.id
      ? { kind: 'success', title: 'Cambios guardados', message: 'La guía «' + guide.title + '» se actualizó correctamente.' }
      : { kind: 'success', title: 'Guía publicada', message: '«' + guide.title + '» se publicó para ' + (dev ? dev.name + ' ' + dev.model : 'tu equipo') + '.' });
    if (guide.id) {
      setGuides(prev => prev.map(g => g.id === guide.id
        ? { ...g, title: guide.title || g.title, level: guide.level || g.level, steps, tools } as Guide
        : g
      ));
    } else {
      setGuides(prev => [...prev, {
        id: Date.now().toString(),
        deviceId: guide.deviceId || '',
        title: guide.title || '',
        level: (guide.level || 'Medio') as Guide['level'],
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&auto=format',
        adminId: CURRENT_ADMIN_ID,
        tools,
        steps,
      }]);
    }
    setEditingGuide(null);
  };

  const deleteGuide = (id: string) => {
    const g = guides.find(x => x.id === id);
    if (!g) return;
    runTask(
      { title: 'Eliminando guía...', message: 'Estamos retirando la guía publicada.', failTitle: 'No se eliminó la guía', failMessage: `«${g.title}» sigue publicada. Comprueba tu conexión e intenta eliminarla de nuevo.`, retryLabel: 'Reintentar eliminación' },
      () => {
        notify({ kind: 'success', title: 'Guía eliminada', message: `«${g.title}» se eliminó y ya no está publicada.` });
        setGuides(prev => prev.filter(x => x.id !== id));
      }
    );
  };

  if (certsOpen) return <CertificatesView certificates={certificates} userName={userName} onAdd={onAddCertificate} onRemove={onRemoveCertificate} onBack={() => setCertsOpen(false)} />;
  if (editingDevice) return <DeviceFormView device={editingDevice} isDuplicate={isDuplicateDevice} onSave={saveDevice} onBack={() => setEditingDevice(null)} />;
  if (editingGuide) return <GuideFormView guide={editingGuide} devices={myDevices} onSave={saveGuide} onBack={() => setEditingGuide(null)} />;
  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'mis-equipos', label: role === 'superadmin' ? 'Equipos' : 'Mis Equipos' },
    { key: 'guias', label: 'Guías' },
    ...(role === 'superadmin' ? [{ key: 'sistema' as AdminTab, label: 'Sistema' }] : []),
    { key: 'perfil', label: 'Perfil' },
  ];

  const confirmDevice = confirmDelete?.kind === 'device' ? devices.find(d => d.id === confirmDelete.id) : undefined;
  const confirmGuide = confirmDelete?.kind === 'guide' ? guides.find(g => g.id === confirmDelete.id) : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      {confirmDevice && (
        <ConfirmDialog
          title="¿Eliminar este dispositivo?" subject={`${confirmDevice.name} ${confirmDevice.model}`}
          message="Este equipo se eliminará de tus dispositivos. No podrás deshacer esta acción."
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { deleteDevice(confirmDevice.id); setConfirmDelete(null); }}
        />
      )}
      {confirmGuide && (
        <ConfirmDialog
          title="¿Eliminar esta guía?" subject={confirmGuide.title}
          message="Esta guía se eliminará. No podrás deshacer esta acción."
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { deleteGuide(confirmGuide.id); setConfirmDelete(null); }}
        />
      )}
      <TopBar
        title={role === 'superadmin' ? 'Super Admin FixTech' : 'FixTech Admin'}
        onLogout={onLogout}
        badge={role === 'superadmin' ? (
          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-1 rounded-full border border-amber-500/30 tracking-wider">SUPER</span>
        ) : undefined}
      />

      <div className="flex px-4 pt-4 gap-1.5 border-b bg-card">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-2 px-1 rounded-t-xl text-xs font-semibold relative pb-3',
              tab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">

        {/* ── Mis Equipos ── */}
        {tab === 'mis-equipos' && (
          <>
            <button
              onClick={() => setEditingDevice({ type: 'laptop' })}
              className="w-full py-4 border-2 border-dashed rounded-2xl text-muted-foreground flex items-center justify-center gap-2 font-medium active:bg-muted"
            >
              <Plus className="w-5 h-5" /> Agregar Dispositivo
            </button>

            {myDevices.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">No hay dispositivos registrados aún.</div>
            )}

            {myDevices.map(device => {
              const deviceGuides = guides.filter(g => g.deviceId === device.id);
              const isExpanded = expandedDeviceId === device.id;

              return (
                <div key={device.id} className="border rounded-2xl bg-muted overflow-hidden">
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border flex-shrink-0">
                      {device.type === 'laptop' ? <Laptop className="w-5 h-5 text-primary" /> : <Monitor className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{device.name}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{device.model} · {device.type === 'laptop' ? 'Laptop' : 'PC'}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => setEditingDevice(device)} className="p-2 text-foreground active:bg-card/50 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmDelete({ kind: 'device', id: device.id })} className="p-2 text-destructive active:bg-destructive/10 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => setExpandedDeviceId(isExpanded ? null : device.id)} className="p-2 text-muted-foreground active:bg-card/50 rounded-xl">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-card/40 p-3 space-y-2">
                      <div className="flex items-center justify-between px-1 mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Guías ({deviceGuides.length})</span>
                        <button
                          onClick={() => setEditingGuide({ level: 'Medio', deviceId: device.id, steps: [], tools: [] })}
                          className="flex items-center gap-1 text-xs font-semibold text-primary py-1.5 px-3 rounded-xl bg-primary/10 active:bg-primary/20"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar Guía
                        </button>
                      </div>

                      {deviceGuides.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-3">Sin guías para este equipo.</p>
                      )}

                      {deviceGuides.map(guide => (
                        <div key={guide.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                          <Wrench className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{guide.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <LevelDot level={guide.level} />
                              <span className="text-[10px] text-muted-foreground">{guide.steps.length} pasos</span>
                            </div>
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0">
                            <button onClick={() => setEditingGuide(guide)} className="p-1.5 text-foreground active:bg-muted rounded-lg" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setConfirmDelete({ kind: 'guide', id: guide.id })} className="p-1.5 text-destructive active:bg-destructive/10 rounded-lg" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── Guías (misma experiencia que usuario) ── */}
        {tab === 'guias' && (
          <>
            <p className="text-xs text-muted-foreground px-1">Toca un equipo para ver sus guías disponibles, igual que lo vería un usuario.</p>

            <div className="space-y-4">
              {devices.map(device => {
                const approvedCount = guides.filter(g => g.deviceId === device.id).length;
                if (approvedCount === 0) return null;
                return (
                  <button
                    key={device.id}
                    onClick={() => onSelectDeviceForGuides(device)}
                    className="w-full border rounded-2xl bg-card overflow-hidden text-left active:scale-[0.99] transition-transform"
                  >
                    <div className="h-28 bg-muted relative w-full overflow-hidden">
                      <img src={device.image} alt={device.name} className="object-cover w-full h-full opacity-90" />
                      <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                        {approvedCount} {approvedCount === 1 ? 'Guía' : 'Guías'}
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{device.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{device.model} · {device.type === 'laptop' ? 'Laptop' : 'PC'}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">Agregado por {ADMIN_NAMES[device.adminId] ?? 'Técnico FixTech'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                );
              })}

              {guides.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">No hay guías aprobadas disponibles.</div>
              )}
            </div>
          </>
        )}

        {/* ── Perfil (Admin) ── */}
        {tab === 'perfil' && (
          <div className="space-y-5 pt-2">
            {/* Avatar */}
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 bg-primary/20 border-2 border-primary/40 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/10">
                <span className="text-3xl font-bold text-primary">
                  {userName ? userName.trim()[0].toUpperCase() : 'A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-xl">{userName || 'Administrador'}</p>
                {role === 'superadmin' && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 tracking-wider">SUPER</span>
                )}
              </div>
              {userEmail && <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>}
              <p className="text-xs text-muted-foreground/60 mt-1 bg-muted border px-3 py-1 rounded-full">
                {role === 'superadmin' ? 'Super Administrador' : 'Técnico Administrador'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Mis Equipos', value: devices.filter(d => d.adminId === CURRENT_ADMIN_ID).length, color: 'text-primary' },
                { label: 'Mis Guías', value: guides.filter(g => g.adminId === CURRENT_ADMIN_ID).length, color: 'text-emerald-400' },
                { label: 'Certificados', value: certificates.length, color: 'text-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-muted border rounded-2xl p-3 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Preferences */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Preferencias</h2>
              <div className="bg-muted border rounded-2xl divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold">Notificaciones</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Avisos de aprobaciones y actividad</p>
                  </div>
                  <button onClick={onToggleNotifications} className={cn('w-11 h-6 rounded-full relative transition-colors flex-shrink-0', notificationsOn ? 'bg-primary' : 'bg-muted-foreground/30')}>
                    <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200', notificationsOn ? 'right-1' : 'left-1')} />
                  </button>
                </div>
              </div>
            </div>

            {/* Certificates */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Certificados</h2>
              {certificates.length === 0 && !certNoticeHidden && (
                <div className="bg-muted border rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">No has subido certificados</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Es opcional. Puedes agregar equipos y publicar guías sin subir certificados.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 ml-8">
                    <button onClick={() => setCertsOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold active:opacity-80">Subir certificado</button>
                    <button onClick={() => setCertNoticeHidden(true)} className="px-4 py-2 bg-card border rounded-full text-xs font-semibold active:bg-background">Ahora no</button>
                  </div>
                </div>
              )}
              <div className="bg-muted border rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Certificado o comprobante</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {certificates.length === 0 ? 'Sube un documento que valide tus conocimientos. Opcional.' : `${certificates.length} ${certificates.length === 1 ? 'documento subido' : 'documentos subidos'}.`}
                  </p>
                </div>
                <button onClick={() => setCertsOpen(true)} className="px-3 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold flex-shrink-0 active:opacity-80">
                  {certificates.length === 0 ? 'Subir archivo' : 'Gestionar'}
                </button>
              </div>
            </div>

            {/* Logout */}
            <button onClick={onLogout} className="w-full py-4 border border-destructive/30 text-destructive rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-destructive/10 transition-colors">
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </div>
        )}

        {/* ── Sistema (Super Admin) ── */}
        {tab === 'sistema' && role === 'superadmin' && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Equipos', value: devices.length, color: 'text-primary' },
                { label: 'Guías', value: guides.length, color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-muted border rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>

            {/* Network simulation */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Simulación de red</h2>
              <div className="bg-muted border rounded-2xl p-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">Prueba las alertas del sistema. Al guardar, subir o eliminar algo, la operación fallará según el estado elegido.</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['ok', 'Normal'], ['offline', 'Sin conexión'], ['down', 'Servicio caído'],
                    ['timeout', 'Tiempo agotado'], ['expired', 'Sesión caducada'], ['error', 'Error de operación'],
                  ] as [NetMode, string][]).map(([m, label]) => (
                    <button key={m} onClick={() => onChangeNetMode(m)} className={cn('py-2.5 rounded-xl text-xs font-semibold border', netMode === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-card')}>{label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* All admins summary */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Administradores</h2>
              {[CURRENT_ADMIN_ID, OTHER_ADMIN_ID].map(adminId => {
                const adminDevices = devices.filter(d => d.adminId === adminId);
                const adminGuides = guides.filter(g => g.adminId === adminId);
                const isCurrent = adminId === CURRENT_ADMIN_ID;
                return (
                  <div key={adminId} className="p-4 bg-muted border rounded-2xl flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-primary/20 border border-primary/30' : 'bg-card border'}`}>
                      <Shield className={`w-5 h-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{isCurrent ? 'Admin Actual (tú)' : 'Admin Externo'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{adminDevices.length} equipos · {adminGuides.length} guías</p>
                    </div>
                    {isCurrent && <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-1 rounded-full border border-primary/30">TÚ</span>}
                  </div>
                );
              })}
            </div>

            {/* All devices with delete option */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Todos los Equipos</h2>
              {devices.map(device => {
                const owner = device.adminId === CURRENT_ADMIN_ID ? 'Admin Actual' : 'Admin Externo';
                return (
                  <div key={device.id} className="flex items-center gap-3 p-3.5 bg-card border rounded-2xl">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center border flex-shrink-0">
                      {device.type === 'laptop' ? <Laptop className="w-4 h-4 text-primary" /> : <Monitor className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{device.name} <span className="text-muted-foreground font-normal">{device.model}</span></p>
                      <p className="text-[10px] text-muted-foreground">{owner}</p>
                    </div>
                    <button onClick={() => setConfirmDelete({ kind: 'device', id: device.id })} className="p-2 text-destructive active:bg-destructive/10 rounded-xl flex-shrink-0" title="Eliminar equipo">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* All guides with delete option */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Todas las Guías</h2>
              {guides.map(guide => {
                const dev = devices.find(d => d.id === guide.deviceId);
                return (
                  <div key={guide.id} className="flex items-center gap-3 p-3.5 border rounded-2xl bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{guide.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <LevelDot level={guide.level} />
                        <span className="text-[10px] text-muted-foreground">{dev?.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setConfirmDelete({ kind: 'guide', id: guide.id })} className="p-2 text-destructive active:bg-destructive/10 rounded-xl" title="Eliminar guía">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Certificates (admin) ─────────────────────────────────────────────────────

const MAX_CERT_BYTES = 10 * 1024 * 1024;

function CertificatesView({ certificates, userName, onAdd, onRemove, onBack }: {
  certificates: Certificate[]; userName: string;
  onAdd: (c: Certificate) => void; onRemove: (id: string) => void; onBack: () => void;
}) {
  const notify = useNotify();
  const runTask = useRunTask();
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f?: File) => {
    if (!f) return;
    const okType = /\.(pdf|jpe?g|png)$/i.test(f.name);
    if (!okType || f.size > MAX_CERT_BYTES) {
      setFile(null);
      setFileError('Revisa el archivo: el formato o el tamaño no es válido. Elige un PDF, JPG o PNG de hasta 10 MB.');
      notify({ key: 'cert-file', persistent: true, kind: 'warning', icon: FileText, title: 'Revisa el archivo', message: 'El formato no se admite o el archivo supera los 10 MB. Elige un PDF, JPG o PNG de hasta 10 MB.', actionLabel: 'Elegir otro archivo', onAction: () => inputRef.current?.click() });
      return;
    }
    setFileError('');
    setFile(f);
  };

  const canSave = !!(title.trim() && file);
  const save = () => {
    if (!canSave || !file) return;
    const cert = { id: Date.now().toString(), title: title.trim(), institution: institution.trim(), fileName: file.name };
    runTask({ title: 'Subiendo documento...', message: 'Estamos cargando tu certificado. Esto depende de tu conexión.', failTitle: 'No se pudo subir el archivo', failMessage: 'El certificado no se subió ni se publicó en tu perfil. Comprueba tu conexión e inténtalo de nuevo.', retryLabel: 'Reintentar' }, () => {
      onAdd(cert);
      notify({ kind: 'success', title: 'Documento subido correctamente', message: 'El archivo ya está disponible en tus certificados.' });
      setTitle(''); setInstitution(''); setFile(null);
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Mis certificados" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-28">
        <div className="flex items-center gap-3 p-3 bg-muted border rounded-2xl">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
            {(userName || 'A').trim()[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName || 'Administrador'}</p>
            <p className="text-xs text-muted-foreground">Tu perfil de técnico</p>
          </div>
          <span className="text-[10px] text-muted-foreground border rounded-full px-2 py-0.5">Opcional</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">Comparte certificados o comprobantes de tus conocimientos. Los documentos que subas se mostrarán en tu perfil público.</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tus certificados</h2>
            <span className="text-[10px] text-muted-foreground">{certificates.length} {certificates.length === 1 ? 'documento' : 'documentos'}</span>
          </div>
          {certificates.length === 0 ? (
            <div className="bg-muted border rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Aún no has subido certificados</p>
                <p className="text-xs text-muted-foreground mt-0.5">Puedes agregar equipos y publicar guías sin subir certificados.</p>
              </div>
            </div>
          ) : certificates.map(c => (
            <div key={c.id} className="bg-muted border rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 bg-card border rounded-xl flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground truncate">{c.institution || 'Sin institución'} · {c.fileName}</p>
              </div>
              <button onClick={() => { onRemove(c.id); notify({ kind: 'success', title: 'Documento eliminado', message: `«${c.title}» ya no aparece en tu perfil.` }); }} className="p-2 text-destructive active:bg-destructive/10 rounded-xl" aria-label="Eliminar certificado"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        <div className="bg-muted border rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold">Agregar documento</h2>
          <LabeledField label="Título del documento" required>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ej. Mantenimiento de equipos" className="w-full px-4 py-3.5 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </LabeledField>
          <LabeledField label="Institución emisora" hint="Opcional">
            <input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Nombre de la institución" className="w-full px-4 py-3.5 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </LabeledField>
          <LabeledField label="Documento" required>
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { pick(e.target.files?.[0]); e.target.value = ''; }} />
            <button onClick={() => inputRef.current?.click()} className={cn('w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-1.5 active:bg-card', fileError && 'border-orange-500/60')}>
              {file ? <FileText className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5 text-primary" />}
              <span className="text-sm font-semibold text-primary">{file ? file.name : 'Seleccionar archivo'}</span>
              <span className="text-[11px] text-muted-foreground">PDF, JPG o PNG · Máximo 10 MB</span>
            </button>
            {fileError && <FieldError>{fileError}</FieldError>}
          </LabeledField>
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-[390px] p-4 bg-card/95 backdrop-blur-md border-t space-y-2">
        <button onClick={save} disabled={!canSave} className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold disabled:bg-muted disabled:text-muted-foreground">Guardar documento</button>
        <button onClick={onBack} className="w-full text-xs text-muted-foreground py-1">Omitir y volver al perfil</button>
      </div>
    </div>
  );
}

// ─── Technician public profile ────────────────────────────────────────────────

function TechnicianProfileView({ adminId, devices, guides, certificates, onBack, onSelectGuide }: {
  adminId: string; devices: Device[]; guides: Guide[]; certificates: Certificate[];
  onBack: () => void; onSelectGuide: (g: Guide) => void;
}) {
  const name = ADMIN_NAMES[adminId] ?? 'Técnico FixTech';
  const techDevices = devices.filter(d => d.adminId === adminId);
  const techGuides = guides.filter(g => g.adminId === adminId);
  const approvedDeviceGuides = (d: Device) => guides.filter(g => g.deviceId === d.id);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Perfil del técnico" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-12">
        <div className="flex flex-col items-center pt-2">
          <div className="w-[72px] h-[72px] bg-primary/20 border-2 border-primary/40 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">{name[0]}</span>
          </div>
          <p className="font-bold text-xl mt-3">{name}</p>
          <span className="text-xs text-muted-foreground bg-muted border px-3 py-0.5 rounded-full mt-2">Técnico</span>
          <p className="text-xs text-muted-foreground mt-3">Equipos y guías compartidos con la comunidad.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Equipos', value: techDevices.length },
            { label: 'Guías', value: techGuides.length },
            { label: 'Certificados', value: certificates.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted border rounded-2xl py-3 text-center">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipos que agregó</h2>
            <span className="text-[11px] text-muted-foreground">{techDevices.length} equipos</span>
          </div>
          <p className="text-xs text-muted-foreground px-1">Un mismo modelo puede tener registros de distintos técnicos, cada uno con su propio proceso.</p>
          {techDevices.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Este técnico aún no agregó equipos.</p>}
          {techDevices.map(d => (
            <div key={d.id} className="bg-muted border rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-card border rounded-full flex items-center justify-center flex-shrink-0">
                  {d.type === 'laptop' ? <Laptop className="w-4 h-4 text-primary" /> : <Monitor className="w-4 h-4 text-primary" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{d.name} {d.model} · {d.type === 'laptop' ? 'Laptop' : 'PC'}</p>
                  <p className="text-xs text-muted-foreground">Agregado por {name}</p>
                </div>
              </div>
              {approvedDeviceGuides(d).map(g => (
                <button key={g.id} onClick={() => onSelectGuide(g)} className="w-full border-t p-4 flex items-center gap-3 text-left active:bg-card/50">
                  <Wrench className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{g.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Nivel {g.level} · {g.steps.length} pasos · {g.tools.length} herramientas</p>
                    <p className="text-xs text-primary mt-0.5">Guía por {ADMIN_NAMES[g.adminId] ?? 'Técnico FixTech'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certificados compartidos</h2>
            <span className="text-[11px] text-muted-foreground">{certificates.length} {certificates.length === 1 ? 'documento' : 'documentos'}</span>
          </div>
          {certificates.length === 0 ? (
            <div className="bg-muted border rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">Este técnico no ha compartido certificados. Es opcional.</p>
            </div>
          ) : certificates.map(c => (
            <div key={c.id} className="bg-muted border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-card border rounded-xl flex items-center justify-center flex-shrink-0"><Award className="w-4 h-4 text-primary" /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground truncate">{c.institution || 'Documento compartido'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Device Form ──────────────────────────────────────────────────────────────

function DeviceFormView({ device, isDuplicate, onSave, onBack }: {
  isDuplicate: (d: Partial<Device>) => boolean;
  device: Partial<Device>;
  onSave: (d: Partial<Device>) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<Partial<Device>>({ type: 'laptop', ...device });
  const duplicate = !!form.model?.trim() && isDuplicate(form);
  const canSave = !!(form.name?.trim() && form.model?.trim()) && !duplicate;
  const [touched, setTouched] = useState({ name: false, model: false });
  const [attempted, setAttempted] = useState(false);
  const nameErr = (touched.name || attempted) && !form.name?.trim();
  const modelErr = (touched.model || attempted) && !form.model?.trim();

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title={device.id ? 'Editar Dispositivo' : 'Nuevo Dispositivo'} onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-32">

        {attempted && !canSave && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{duplicate ? 'Este modelo ya está registrado' : 'Falta información obligatoria'}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{duplicate ? 'Ya tienes este modelo y tipo en tus equipos.' : 'El nombre y el modelo son obligatorios para guardar el dispositivo.'}</p>
            </div>
          </div>
        )}

        <LabeledField label="Nombre" hint="Marca y nombre del equipo. Ej: Lenovo LOQ, HP Pavilion." required>
          <input
            type="text"
            placeholder="ej. Lenovo LOQ"
            value={form.name || ''}
            onChange={e => setForm({ ...form, name: e.target.value })}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            className={cn('w-full px-4 py-3.5 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm', nameErr && 'border-orange-500/70')}
          />
          {nameErr && <FieldError>Escribe el nombre del equipo.</FieldError>}
        </LabeledField>

        <LabeledField label="Número de Modelo" hint="Código del modelo, lo encuentras en la etiqueta trasera. Ej: 15IRH8, G533Z." required>
          <input
            type="text"
            placeholder="ej. 15IRH8"
            value={form.model || ''}
            onChange={e => setForm({ ...form, model: e.target.value })}
            onBlur={() => setTouched(t => ({ ...t, model: true }))}
            className={cn('w-full px-4 py-3.5 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm', modelErr && 'border-orange-500/70')}
          />
          {modelErr && <FieldError>Escribe el número de modelo.</FieldError>}
          {duplicate && <FieldError>Ya tienes registrado este modelo como {form.type === 'pc' ? 'PC' : 'Laptop'}. Cada técnico puede registrarlo una sola vez.</FieldError>}
        </LabeledField>

        <LabeledField label="Tipo de Equipo" hint="¿Es una laptop (portátil con pantalla y batería) o un PC de escritorio?" required>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'laptop' as DeviceType, Icon: Laptop, label: 'Laptop', desc: 'Portátil con batería' },
              { value: 'pc' as DeviceType, Icon: Monitor, label: 'PC de Escritorio', desc: 'Torre o all-in-one' },
            ]).map(({ value, Icon, label, desc }) => (
              <button
                key={value}
                onClick={() => setForm({ ...form, type: value })}
                className={cn(
                  'flex flex-col items-center gap-2 py-5 px-3 rounded-2xl border-2 transition-colors',
                  form.type === value ? 'border-primary bg-primary/10' : 'border-border bg-card'
                )}
              >
                <Icon className={cn('w-8 h-8', form.type === value ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <p className={cn('text-xs font-bold text-center', form.type === value ? 'text-primary' : 'text-foreground')}>{label}</p>
                  <p className="text-[10px] text-muted-foreground text-center mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </LabeledField>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-card border-t p-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <button
          onClick={() => canSave ? onSave(form) : setAttempted(true)}
          className={cn(
            'w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all',
            'bg-primary text-primary-foreground active:scale-[0.98]'
          )}
        >
          <Check className="w-5 h-5" />
          {device.id ? 'Actualizar' : 'Guardar Dispositivo'}
        </button>
      </div>
    </div>
  );
}

// ─── Guide Form ───────────────────────────────────────────────────────────────

function GuideFormView({ guide, devices, onSave, onBack }: {
  guide: Partial<Guide>;
  devices: Device[];
  onSave: (guide: Partial<Guide>, steps: GuideStep[], tools: string[]) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<Partial<Guide>>({ level: 'Medio', ...guide });
  const [steps, setSteps] = useState<GuideStep[]>(guide.steps || []);
  const [tools, setTools] = useState<string[]>(guide.tools || []);
  const [newTool, setNewTool] = useState('');
  const [attempted, setAttempted] = useState(false);
  const titleOk = !!form.title?.trim();
  const stepsOk = steps.length > 0 && steps.every(st => st.title.trim());
  const canSave = titleOk && !!form.deviceId && stepsOk;

  const addTool = () => {
    const t = newTool.trim();
    if (t) { setTools(prev => [...prev, t]); setNewTool(''); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title={guide.id ? 'Editar Guía' : 'Nueva Guía'} onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">

        {attempted && !canSave && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Falta información obligatoria</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Completa la información obligatoria y los pasos antes de guardar la guía.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Información General</h2>

          <LabeledField label="Título" hint="Qué mantenimiento hace esta guía. Ej: Cambiar batería, Limpiar ventilador." required>
            <input
              type="text"
              placeholder="ej. Cambiar Batería"
              value={form.title || ''}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={cn('w-full px-4 py-3.5 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm', attempted && !titleOk && 'border-orange-500/70')}
            />
            {attempted && !titleOk && <FieldError>Escribe el título de la guía.</FieldError>}
          </LabeledField>

          <LabeledField
            label="Dispositivo"
            hint={guide.id ? 'No se puede cambiar al editar.' : 'Equipo al que aplica esta guía.'}
          >
            <select
              value={form.deviceId || ''}
              onChange={e => setForm({ ...form, deviceId: e.target.value })}
              disabled={!!guide.id}
              className="w-full px-4 py-3.5 bg-card border rounded-xl outline-none appearance-none text-sm disabled:opacity-50"
            >
              <option value="" disabled>Selecciona un dispositivo...</option>
              {devices.map(d => (
                <option key={d.id} value={d.id}>{d.name} {d.model}</option>
              ))}
            </select>
          </LabeledField>

          <LabeledField label="Dificultad" hint="Qué tan difícil es para el usuario: Bajo = fácil, Medio = algo de práctica, Alto = técnico.">
            <div className="grid grid-cols-3 gap-2">
              {(['Bajo', 'Medio', 'Alto'] as Guide['level'][]).map(level => {
                const s = {
                  Bajo: { active: 'border-emerald-500 bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-500' },
                  Medio: { active: 'border-amber-500 bg-amber-500/10 text-amber-400', dot: 'bg-amber-500' },
                  Alto: { active: 'border-red-500 bg-red-500/10 text-red-400', dot: 'bg-red-500' },
                }[level];
                return (
                  <button
                    key={level}
                    onClick={() => setForm({ ...form, level })}
                    className={cn(
                      'py-3.5 rounded-xl border-2 text-sm font-semibold transition-colors flex flex-col items-center gap-1.5',
                      form.level === level ? s.active : 'border-border bg-card text-muted-foreground'
                    )}
                  >
                    <span className={cn('w-2.5 h-2.5 rounded-full', form.level === level ? s.dot : 'bg-muted-foreground/30')} />
                    {level}
                  </button>
                );
              })}
            </div>
          </LabeledField>
        </div>

        <div className="border-t" />

        {/* Tools section */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Herramientas Necesarias</h2>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Lista lo que el usuario debe tener listo antes de empezar.</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ej. Destornillador Phillips #0"
              value={newTool}
              onChange={e => setNewTool(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTool()}
              className="flex-1 px-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <button
              onClick={addTool}
              disabled={!newTool.trim()}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm active:scale-[0.98] disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick-add suggestions */}
          <div className="flex flex-wrap gap-2">
            {['Destornillador Phillips #0', 'Púa de apertura', 'Pulsera antiestática', 'Pasta térmica', 'Alcohol isopropílico', 'Compresor de aire'].filter(s => !tools.includes(s)).map(s => (
              <button
                key={s}
                onClick={() => setTools(prev => [...prev, s])}
                className="text-xs px-3 py-1.5 bg-muted border rounded-full text-muted-foreground active:bg-primary/10 active:text-primary active:border-primary/30"
              >
                + {s}
              </button>
            ))}
          </div>

          {tools.length > 0 && (
            <ul className="space-y-2">
              {tools.map((tool, i) => (
                <li key={i} className="flex items-center gap-3 p-3 bg-muted border rounded-xl">
                  <Wrench className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm">{tool}</span>
                  <button onClick={() => setTools(prev => prev.filter((_, idx) => idx !== i))} className="p-1 text-destructive active:bg-destructive/10 rounded-lg">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tools.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-2">Ninguna herramienta agregada. Usa las sugerencias de arriba o escribe la tuya.</p>
          )}
        </div>

        <div className="border-t" />
        <StepBuilder steps={steps} onChange={setSteps} />
        {attempted && !stepsOk && <FieldError>Agrega al menos un paso y complétalo (cada paso necesita título).</FieldError>}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-card border-t p-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <button
          onClick={() => canSave ? onSave(form, steps, tools) : setAttempted(true)}
          className={cn(
            'w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all',
            'bg-primary text-primary-foreground active:scale-[0.98]'
          )}
        >
          <Check className="w-5 h-5" />
          {guide.id ? 'Actualizar Guía' : 'Guardar Guía'}
          {steps.length > 0 && <span className="text-xs opacity-70 ml-1">({steps.length} pasos)</span>}
        </button>
      </div>
    </div>
  );
}

// ─── Step Builder ─────────────────────────────────────────────────────────────

function StepBuilder({ steps, onChange }: { steps: GuideStep[]; onChange: (steps: GuideStep[]) => void }) {
  const addStep = () => {
    onChange([...steps, {
      id: Date.now().toString(),
      title: '', description: '', image: '',
      hasAlert: false, alertText: '', alertType: 'warning', alertConfirmText: '',
    }]);
  };

  const update = (id: string, patch: Partial<GuideStep>) =>
    onChange(steps.map(s => s.id === id ? { ...s, ...patch } : s));

  const remove = (id: string) => onChange(steps.filter(s => s.id !== id));

  const move = (id: string, dir: 'up' | 'down') => {
    const idx = steps.findIndex(s => s.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === steps.length - 1) return;
    const next = [...steps];
    const other = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[other]] = [next[other], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pasos del Tutorial</h2>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Instrucciones paso a paso que verá el usuario.</p>
        </div>
        <button onClick={addStep} className="flex items-center gap-1.5 text-xs font-semibold text-primary py-2 px-3 rounded-xl bg-primary/10 active:bg-primary/20 flex-shrink-0 ml-3">
          <Plus className="w-3.5 h-3.5" /> Paso
        </button>
      </div>

      {steps.length === 0 && (
        <button onClick={addStep} className="w-full py-10 border-2 border-dashed rounded-2xl text-muted-foreground flex flex-col items-center justify-center gap-3 active:bg-muted">
          <Plus className="w-6 h-6 opacity-50" />
          <div className="text-center">
            <p className="text-sm font-medium">Agrega el primer paso</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Cada paso tiene título, descripción, imagen y alerta opcional</p>
          </div>
        </button>
      )}

      {steps.map((step, idx) => (
        <StepCard
          key={step.id}
          step={step} index={idx + 1}
          isFirst={idx === 0} isLast={idx === steps.length - 1}
          onUpdate={patch => update(step.id, patch)}
          onRemove={() => remove(step.id)}
          onMoveUp={() => move(step.id, 'up')}
          onMoveDown={() => move(step.id, 'down')}
        />
      ))}
    </div>
  );
}

function StepCard({ step, index, isFirst, isLast, onUpdate, onRemove, onMoveUp, onMoveDown }: {
  step: GuideStep;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<GuideStep>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-2xl bg-card overflow-hidden">
      <div className="p-3.5 flex items-center gap-3 bg-muted/60">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary-foreground">{index}</span>
        </div>
        <span className="flex-1 text-sm font-semibold truncate min-w-0">
          {step.title || <span className="text-muted-foreground font-normal italic text-xs">Sin título</span>}
        </span>
        {step.hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1.5 rounded-lg text-muted-foreground active:bg-muted disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1.5 rounded-lg text-muted-foreground active:bg-muted disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
          <button onClick={onRemove} className="p-1.5 rounded-lg text-destructive active:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded-lg text-muted-foreground active:bg-muted">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 border-t">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Título del paso</label>
            <input type="text" placeholder="ej. Desconectar batería" value={step.title} onChange={e => onUpdate({ title: e.target.value })} className="w-full px-4 py-3 bg-muted border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Descripción</label>
            <textarea
              placeholder="Qué debe hacer el usuario en este paso..."
              value={step.description}
              onChange={e => onUpdate({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-muted border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">URL de imagen <span className="font-normal text-muted-foreground/60">(opcional)</span></label>
            <input type="url" placeholder="https://..." value={step.image} onChange={e => onUpdate({ image: e.target.value })} className="w-full px-4 py-3 bg-muted border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            {step.image && (
              <div className="h-28 rounded-xl overflow-hidden border bg-muted">
                <img src={step.image} alt="Vista previa" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* JIT Alert */}
          <div className="border rounded-2xl overflow-hidden">
            <button
              onClick={() => onUpdate({ hasAlert: !step.hasAlert })}
              className={cn('w-full p-4 flex items-center gap-3 text-left', step.hasAlert ? 'bg-amber-950/20' : 'bg-muted/40')}
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', step.hasAlert ? 'bg-amber-500/20' : 'bg-card border')}>
                <AlertTriangle className={cn('w-5 h-5', step.hasAlert ? 'text-amber-500' : 'text-muted-foreground')} />
              </div>
              <div className="flex-1">
                <p className={cn('text-sm font-semibold', step.hasAlert ? 'text-amber-400' : 'text-foreground')}>
                  {step.hasAlert ? 'Alerta activada' : 'Agregar Alerta'}
                </p>
                <p className="text-xs text-muted-foreground">Aviso importante que el usuario debe leer antes de continuar</p>
              </div>
              <div className={cn('w-11 h-6 rounded-full relative transition-colors flex-shrink-0', step.hasAlert ? 'bg-amber-500' : 'bg-muted-foreground/30')}>
                <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200', step.hasAlert ? 'right-1' : 'left-1')} />
              </div>
            </button>

            {step.hasAlert && (
              <div className="p-4 border-t bg-amber-950/10 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Tipo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'warning' as AlertKind, label: 'Advertencia', cls: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
                      { value: 'danger' as AlertKind, label: 'Peligro', cls: 'border-orange-500 bg-orange-500/10 text-orange-400' },
                      { value: 'info' as AlertKind, label: 'Nota', cls: 'border-blue-500 bg-blue-500/10 text-blue-400' },
                    ]).map(({ value, label, cls }) => (
                      <button key={value} onClick={() => onUpdate({ alertType: value })} className={cn('py-2.5 rounded-xl border-2 text-xs font-semibold transition-colors', step.alertType === value ? cls : 'border-border bg-card text-muted-foreground')}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Mensaje</label>
                  <textarea placeholder="ej. No toques los componentes sin desconectar la batería." value={step.alertText} onChange={e => onUpdate({ alertText: e.target.value })} rows={2} className="w-full px-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Confirmación del usuario <span className="font-normal text-muted-foreground/60">(opcional)</span></label>
                  <p className="text-xs text-muted-foreground/60">Si lo agregas, el usuario debe marcar una casilla para poder avanzar.</p>
                  <input type="text" placeholder="ej. He desconectado la batería" value={step.alertConfirmText} onChange={e => onUpdate({ alertConfirmText: e.target.value })} className="w-full px-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── User Views ───────────────────────────────────────────────────────────────

function UserDashboardView({ devices, guides, userName, userEmail, savedDeviceIds, pinnedGuideIds, notificationsOn, onToggleNotifications, onToggleSave, onLogout, onSelectDevice }: {
  devices: Device[];
  guides: Guide[];
  userName: string;
  userEmail: string;
  savedDeviceIds: string[];
  pinnedGuideIds: string[];
  notificationsOn: boolean;
  onToggleNotifications: () => void;
  onToggleSave: (id: string) => void;
  onLogout: () => void;
  onSelectDevice: (d: Device) => void;
}) {
  const [tab, setTab] = useState<'my-devices' | 'catalog' | 'perfil'>('my-devices');
  const [search, setSearch] = useState('');

  const displayDevices = tab === 'my-devices'
    ? devices.filter(d => savedDeviceIds.includes(d.id))
    : devices;

  const filteredDevices = displayDevices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.model.toLowerCase().includes(search.toLowerCase())
  );

  const initial = userName ? userName.trim()[0].toUpperCase() : 'U';

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="FixTech" onLogout={tab !== 'perfil' ? onLogout : undefined} />

      <div className="flex gap-1.5 px-4 pt-3 pb-0 bg-card border-b">
        {([
          { key: 'my-devices', label: 'Mis Equipos' },
          { key: 'catalog', label: 'Explorar' },
          { key: 'perfil', label: 'Perfil' },
        ] as { key: typeof tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-2.5 text-xs font-semibold rounded-t-xl pb-3',
              tab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-5 flex-1 overflow-y-auto pb-24">

        {/* ── Device tabs ── */}
        {(tab === 'my-devices' || tab === 'catalog') && (
          <>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Buscar dispositivo..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-muted border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>

            <div className="space-y-4">
              {filteredDevices.map(device => {
                const guidesCount = guides.filter(g => g.deviceId === device.id).length;
                const isSaved = savedDeviceIds.includes(device.id);
                return (
                  <div key={device.id} className="w-full border rounded-2xl bg-card overflow-hidden relative">
                    <button onClick={() => onSelectDevice(device)} className="w-full text-left flex flex-col active:scale-[0.99] transition-transform">
                      <div className="h-32 bg-muted relative w-full overflow-hidden">
                        <img src={device.image} alt={device.name} className="object-cover w-full h-full opacity-90" />
                        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          {guidesCount} {guidesCount === 1 ? 'Guía' : 'Guías'}
                        </div>
                      </div>
                      <div className="p-4 flex justify-between items-center bg-card">
                        <div>
                          <h3 className="font-semibold text-lg pr-8">{device.name}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{device.model} · {device.type === 'laptop' ? 'Laptop' : 'PC'}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">Agregado por {ADMIN_NAMES[device.adminId] ?? 'Técnico FixTech'}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onToggleSave(device.id); }}
                      className="absolute bottom-4 right-12 p-2 rounded-full active:bg-muted/50"
                      title={isSaved ? 'Remover de Mis Equipos' : 'Añadir a Mis Equipos'}
                    >
                      {isSaved ? <Bookmark className="w-5 h-5 text-primary fill-primary" /> : <BookmarkPlus className="w-5 h-5 text-muted-foreground" />}
                    </button>
                  </div>
                );
              })}
              {filteredDevices.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  {tab === 'my-devices' ? 'No tienes equipos guardados. Explora y usa el marcador para guardarlos.' : 'No se encontraron dispositivos.'}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Perfil ── */}
        {tab === 'perfil' && (
          <div className="space-y-5 pt-2">
            {/* Avatar */}
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 bg-primary/20 border-2 border-primary/40 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/10">
                <span className="text-3xl font-bold text-primary">{initial}</span>
              </div>
              <p className="font-bold text-xl">{userName || 'Usuario'}</p>
              {userEmail && <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted border rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">{savedDeviceIds.length}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Equipos guardados</p>
              </div>
              <div className="bg-muted border rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{pinnedGuideIds.length}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Guías favoritas</p>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Preferencias</h2>
              <div className="bg-muted border rounded-2xl divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold">Notificaciones</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Avisos de nuevas guías disponibles</p>
                  </div>
                  <button onClick={onToggleNotifications} className={cn('w-11 h-6 rounded-full relative transition-colors flex-shrink-0', notificationsOn ? 'bg-primary' : 'bg-muted-foreground/30')}>
                    <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200', notificationsOn ? 'right-1' : 'left-1')} />
                  </button>
                </div>
              </div>
            </div>

            {/* App info */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Acerca de</h2>
              <div className="bg-muted border rounded-2xl divide-y divide-border">
                <div className="flex items-center justify-between p-4">
                  <p className="text-sm font-semibold">FixTech</p>
                  <span className="text-xs text-muted-foreground bg-card border px-2 py-1 rounded-lg font-mono">v1.0</span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Guías de mantenimiento para tus equipos, creadas por técnicos certificados.
                  </p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button onClick={onLogout} className="w-full py-4 border border-destructive/30 text-destructive rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-destructive/10 transition-colors">
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskSelectionView({ device, guides, pinnedGuideIds, onTogglePin, onBack, onSelect, onViewTech }: {
  device: Device;
  guides: Guide[];
  pinnedGuideIds: string[];
  onTogglePin: (id: string) => void;
  onBack: () => void;
  onSelect: (g: Guide) => void;
  onViewTech: (adminId: string) => void;
}) {
  const sortedGuides = [...guides].sort((a, b) => {
    return (pinnedGuideIds.includes(b.id) ? 1 : 0) - (pinnedGuideIds.includes(a.id) ? 1 : 0);
  });

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title={device.name} onBack={onBack} />
      <div className="p-4 space-y-4 flex-1 overflow-y-auto pb-24">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Selecciona un Mantenimiento</h2>
        {sortedGuides.map(guide => {
          const isPinned = pinnedGuideIds.includes(guide.id);
          return (
            <div key={guide.id} className="relative border rounded-2xl bg-card overflow-hidden">
              <button onClick={() => onSelect(guide)} className="w-full flex flex-col text-left active:scale-[0.99] transition-transform">
                <div className="h-28 bg-muted relative overflow-hidden border-b w-full">
                  <img src={guide.image} alt={guide.title} className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="p-4 flex items-start gap-4 w-full">
                  <div className="mt-1 flex-shrink-0 text-muted-foreground bg-muted p-2 rounded-xl">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="pr-8">
                    <h3 className="font-semibold">{guide.title}</h3>
                    <div className="mt-1"><LevelDot level={guide.level} /></div>
                    <p className="text-xs text-muted-foreground mt-1">{guide.steps.length} pasos · {guide.tools.length} herramientas</p>
                    <p className="text-xs text-muted-foreground/50 mt-0.5">Por {ADMIN_NAMES[guide.adminId] ?? 'Técnico FixTech'}</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => onViewTech(guide.adminId)}
                className="mx-4 mb-4 -mt-1 ml-[76px] flex items-center gap-1.5 text-xs font-medium text-primary active:opacity-70"
              >
                <User className="w-3.5 h-3.5" /> Ver perfil del técnico
              </button>
              {pinnedGuideIds !== undefined && onTogglePin && (
                <button
                  onClick={e => { e.stopPropagation(); onTogglePin(guide.id); }}
                  className="absolute bottom-4 right-4 p-2 rounded-full active:bg-muted/50"
                  title={isPinned ? 'Desanclar' : 'Anclar como favorito'}
                >
                  <Star className={cn('w-5 h-5', isPinned ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground')} />
                </button>
              )}
            </div>
          );
        })}
        {guides.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No hay guías disponibles para este equipo aún.</div>
        )}
      </div>
    </div>
  );
}

// ─── Preparation View ─────────────────────────────────────────────────────────

const TOOL_ICONS = [Wrench, Tool, Zap, Thermometer];

function PreparationView({ guide, onBack, onNext }: { guide: Guide; onBack: () => void; onNext: () => void }) {
  const color = { Bajo: 'green', Medio: 'amber', Alto: 'red' }[guide.level];

  const displayTools = guide.tools && guide.tools.length > 0
    ? guide.tools
    : { Alto: ['Destornillador Phillips #0', 'Pasta térmica', 'Púa de apertura', 'Alcohol isopropílico'], Medio: ['Destornillador Phillips #0', 'Pulsera antiestática', 'Púa de apertura'], Bajo: ['Destornillador Phillips #0', 'Púa de apertura'] }[guide.level];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title={guide.title} onBack={onBack} />
      <div className="flex-1 pb-32 overflow-y-auto">
        <div className="aspect-[4/3] bg-muted relative border-b w-full">
          <img src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&h=600&fit=crop&auto=format" alt="Herramientas" className="object-cover w-full h-full opacity-90" />
        </div>
        <div className="p-4 space-y-6 mt-4">
          <div className="flex items-center gap-4 p-5 bg-muted rounded-2xl border">
            <div className="flex gap-2 p-2.5 bg-card border rounded-xl shadow-sm">
              <div className={cn('w-3.5 h-3.5 rounded-full', color === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-muted-foreground/20')} />
              <div className={cn('w-3.5 h-3.5 rounded-full', color === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-muted-foreground/20')} />
              <div className={cn('w-3.5 h-3.5 rounded-full', color === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-muted-foreground/20')} />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">Dificultad</div>
              <div className="font-semibold text-lg">Nivel {guide.level}</div>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">Lo que vas a necesitar</h2>
            <ul className="space-y-2">
              {displayTools.map((toolLabel, i) => {
                const IconComp = TOOL_ICONS[i % TOOL_ICONS.length];
                return (
                  <li key={i} className="flex items-center gap-4 p-3.5 bg-card border rounded-2xl">
                    <div className="p-2.5 bg-muted rounded-xl flex-shrink-0">
                      <IconComp className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-sm font-medium">{toolLabel}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t p-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <button onClick={onNext} className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          Iniciar Tutorial <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Tutorial View ────────────────────────────────────────────────────────────

function TutorialView({ guide, onBack, onComplete }: { guide: Guide; onBack: () => void; onComplete: () => void }) {
  const steps = guide.steps.length > 0 ? guide.steps : stepsRam;
  const [stepIndex, setStepIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const canProceed = !currentStep.hasAlert || !currentStep.alertConfirmText || confirmed;

  const goTo = (idx: number) => { setStepIndex(idx); setConfirmed(false); };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title={guide.title} />

      <div className="px-4 py-3 bg-secondary border-b flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">Progreso</span>
        <span className="text-sm font-bold">Paso {stepIndex + 1} de {steps.length}</span>
      </div>

      <div className="flex-1 pb-40 overflow-y-auto">
        <div className="aspect-[4/3] bg-muted relative border-b w-full">
          {currentStep.image
            ? <img src={currentStep.image} alt="Instrucción" className="object-cover w-full h-full opacity-90" />
            : <div className="w-full h-full flex items-center justify-center"><Image className="w-16 h-16 text-muted-foreground/20" /></div>
          }
          {isFirst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 border-4 border-primary rounded-full animate-ping opacity-50" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">{currentStep.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{currentStep.description}</p>
          </div>

          {currentStep.hasAlert && currentStep.alertText && (
            <AlertBlock
              alertType={currentStep.alertType}
              alertText={currentStep.alertText}
              confirmText={currentStep.alertConfirmText}
              confirmed={confirmed}
              onConfirm={() => setConfirmed(v => !v)}
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-card border-t p-4 pb-[max(env(safe-area-inset-bottom),1.5rem)] z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        <div className="flex gap-3">
          <button
            onClick={isFirst ? onBack : () => goTo(stepIndex - 1)}
            className={cn(
              'py-4 rounded-2xl font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 bg-secondary text-secondary-foreground',
              isFirst ? 'w-14 flex-shrink-0' : 'flex-1'
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            {!isFirst && 'Anterior'}
          </button>

          {isLast ? (
            <button
              onClick={onComplete}
              disabled={!canProceed}
              className={cn(
                'flex-1 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2',
                canProceed ? 'bg-primary text-primary-foreground active:scale-[0.98]' : 'bg-muted text-muted-foreground opacity-60'
              )}
            >
              Finalizar <Check className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => canProceed && goTo(stepIndex + 1)}
              disabled={!canProceed}
              className={cn(
                'flex-1 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2',
                canProceed ? 'bg-primary text-primary-foreground active:scale-[0.98]' : 'bg-muted text-muted-foreground opacity-60'
              )}
            >
              {canProceed ? 'Siguiente' : 'Confirma para continuar'}
              {canProceed && <ChevronRight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
