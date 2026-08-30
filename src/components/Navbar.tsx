import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, LayoutDashboard, MessageSquare, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
];

export function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav className="mt-3 flex items-center justify-between rounded-2xl glass px-4 py-3 shadow-xl">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent glow-primary"
            >
              <Brain className="h-5 w-5 text-white" />
            </motion.div>
            <span className="font-display font-bold text-lg tracking-tight">
              Study<span className="text-gradient">Sphere</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <Link key={l.to} to={l.to}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'relative text-sm font-medium',
                      active && 'text-foreground'
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-md bg-white/10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {l.icon && <l.icon className="h-4 w-4" />}
                      {l.label}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Link to="/dashboard">
              <Button className="btn-glow bg-gradient-to-r from-primary to-secondary text-white">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Get Started
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden grid place-items-center h-9 w-9 rounded-lg glass"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 rounded-2xl glass p-3 flex flex-col gap-1"
          >
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 flex items-center gap-2',
                  location.pathname === l.to && 'bg-white/10'
                )}
              >
                {l.icon && <l.icon className="h-4 w-4" />}
                {l.label}
              </Link>
            ))}
            <Link to="/dashboard" onClick={() => setOpen(false)}>
              <Button className="w-full mt-1 btn-glow bg-gradient-to-r from-primary to-secondary text-white">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Get Started
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
