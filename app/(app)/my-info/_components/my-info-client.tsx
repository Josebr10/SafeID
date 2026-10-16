'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { STANDARD_CATEGORIES, CUSTOM_CATEGORY_ID, getCategoryLabel } from '@/lib/categories';
import {
  Plus, Search, Eye, EyeOff, Pencil, Trash2, Users, Shield, Stethoscope, Lock, Loader2, Inbox, Tag
} from 'lucide-react';

interface InfoItem {
  id: string;
  label: string;
  value: string;
  accessLevel: string;
  category: string | null;
  enabled: boolean;
}

const levelConfig: Record<string, { icon: any; color: string; label: string }> = {
  public: { icon: Users, color: 'text-safe', label: 'Público' },
  emergency: { icon: Shield, color: 'text-warning', label: 'Emergencial' },
  professional: { icon: Stethoscope, color: 'text-primary', label: 'Profissional' },
  restricted: { icon: Lock, color: 'text-alert', label: 'Restrito' },
};

function SkeletonCard() {
  return (
    <Card className="glass">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 animate-pulse">
          <div className="h-9 w-9 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
            <div className="h-2.5 w-16 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyInfoClient() {
  const [items, setItems] = useState<InfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<InfoItem | null>(null);
  const [form, setForm] = useState({ label: '', value: '', accessLevel: 'public', category: '', customCategory: '', enabled: true });
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/personal-info');
      if (res.ok) {
        const data = await res.json();
        setItems(data ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm({ label: '', value: '', accessLevel: 'public', category: '', customCategory: '', enabled: true });
    setModalOpen(true);
  };

  const openEdit = (item: InfoItem) => {
    setEditing(item);
    const stdCat = STANDARD_CATEGORIES.find(c => c.id === item.category || c.label === item.category);
    const catValue = stdCat ? stdCat.id : (item.category ? CUSTOM_CATEGORY_ID : '');
    const customCat = stdCat ? '' : (item.category ?? '');
    setForm({ label: item.label, value: item.value, accessLevel: item.accessLevel, category: catValue, customCategory: customCat, enabled: item.enabled });
    setModalOpen(true);
  };

  const handleCategoryChange = (catId: string) => {
    if (catId === CUSTOM_CATEGORY_ID) {
      setForm(prev => ({ ...prev, category: CUSTOM_CATEGORY_ID, customCategory: '' }));
    } else {
      const cat = STANDARD_CATEGORIES.find(c => c.id === catId);
      setForm(prev => ({
        ...prev,
        category: catId,
        customCategory: '',
        accessLevel: cat?.defaultAccessLevel ?? prev.accessLevel,
      }));
    }
  };

  const handleSave = async () => {
    if (!form.label?.trim() || !form.value?.trim()) {
      toast.error('Rótulo e valor são obrigatórios');
      return;
    }
    setSaving(true);
    const categoryToSave = form.category === CUSTOM_CATEGORY_ID
      ? form.customCategory?.trim() || ''
      : (STANDARD_CATEGORIES.find(c => c.id === form.category)?.label ?? '');
    try {
      const url = editing ? `/api/personal-info/${editing.id}` : '/api/personal-info';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, category: categoryToSave }),
      });
      if (res.ok) {
        toast.success(editing ? 'Atualizado com sucesso' : 'Criado com sucesso');
        setModalOpen(false);
        fetchItems();
      } else {
        const data = await res.json();
        toast.error(data?.error ?? 'Erro ao salvar');
      }
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/personal-info/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Excluído com sucesso');
        setDeleteId(null);
        fetchItems();
      }
    } catch { toast.error('Erro ao excluir'); }
  };

  const toggleEnabled = async (item: InfoItem) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, enabled: !i.enabled } : i));
    try {
      const res = await fetch(`/api/personal-info/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !item.enabled }),
      });
      if (!res.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, enabled: item.enabled } : i));
        toast.error('Erro ao atualizar');
      }
    } catch {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, enabled: item.enabled } : i));
      toast.error('Erro ao atualizar');
    }
  };

  const filtered = useMemo(() => (items ?? []).filter((item: InfoItem) => {
    const s = search?.toLowerCase();
    const matchSearch = !s || item.label?.toLowerCase()?.includes(s) || item.value?.toLowerCase()?.includes(s);
    const matchLevel = filterLevel === 'all' || item.accessLevel === filterLevel;
    return matchSearch && matchLevel;
  }), [items, search, filterLevel]);

  return (
    <PageWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Minhas Informações</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais e níveis de acesso</p>
        </div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Nova informação
          </Button>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por rótulo ou valor..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filtrar por nível" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="public">Público</SelectItem>
            <SelectItem value="emergency">Emergencial</SelectItem>
            <SelectItem value="professional">Profissional</SelectItem>
            <SelectItem value="restricted">Restrito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">{search || filterLevel !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhuma informação cadastrada'}</p>
          {!search && filterLevel === 'all' && (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button variant="outline" onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Adicionar primeira informação</Button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered?.map((item: InfoItem, i: number) => {
              const cfg = levelConfig[item?.accessLevel] ?? levelConfig.public;
              const Icon = cfg?.icon;
              return (
                <motion.div
                  key={item?.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <Card className="glass group hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 ${cfg?.color} group-hover:scale-110 transition-transform duration-200`}>
                            {Icon && <Icon className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{item?.label}</p>
                              {item?.category && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                  <Tag className="h-2.5 w-2.5" />
                                  {getCategoryLabel(item?.category)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">{item?.value}</p>
                            <p className={`text-[10px] mt-1 ${cfg?.color}`}>{cfg?.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => toggleEnabled(item)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title={item?.enabled ? 'Visível' : 'Oculto'}>
                            {item?.enabled ? <Eye className="h-4 w-4 text-safe" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(item)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></motion.button>
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setDeleteId(item?.id)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Trash2 className="h-4 w-4 text-alert" /></motion.button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal criar/editar */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-strong">
          <DialogHeader><DialogTitle className="font-display">{editing ? 'Editar informação' : 'Nova informação'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>
                  {STANDARD_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.label}
                        <span className="text-[10px] text-muted-foreground">({cat.examples})</span>
                      </span>
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_CATEGORY_ID}>
                    <span className="flex items-center gap-2 text-primary">
                      + Criar categoria personalizada
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {form.category === CUSTOM_CATEGORY_ID && (
                <Input
                  placeholder="Nome da categoria personalizada"
                  value={form.customCategory}
                  onChange={(e: any) => setForm({ ...form, customCategory: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-2"><Label>Rótulo</Label><Input placeholder="Ex: Nome completo" value={form.label} onChange={(e: any) => setForm({ ...form, label: e.target.value })} /></div>
            <div className="space-y-2"><Label>Valor</Label><Input placeholder="Ex: João Silva" value={form.value} onChange={(e: any) => setForm({ ...form, value: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Nível de acesso</Label>
              {form.category && form.category !== CUSTOM_CATEGORY_ID && (
                <p className="text-[10px] text-muted-foreground -mt-1">
                  Nível sugerido pela categoria selecionada
                </p>
              )}
              <Select value={form.accessLevel} onValueChange={(v: string) => setForm({ ...form, accessLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="emergency">Emergencial</SelectItem>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="restricted">Restrito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between"><Label>Visível no QR Code</Label><Switch checked={form.enabled} onCheckedChange={(v: boolean) => setForm({ ...form, enabled: v })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmar exclusão */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="glass-strong">
          <DialogHeader><DialogTitle className="font-display">Confirmar exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir esta informação? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
