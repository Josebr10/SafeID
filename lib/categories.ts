/**
 * Categorias padronizadas com nível de acesso padrão sugerido.
 * O usuário pode escolher uma dessas ou criar uma categoria personalizada.
 */

export interface CategoryDef {
  id: string;
  label: string;
  defaultAccessLevel: string;
  icon: string; // lucide icon name for reference
  examples: string;
}

export const STANDARD_CATEGORIES: CategoryDef[] = [
  { id: 'contato', label: 'Contato', defaultAccessLevel: 'public', icon: 'Phone', examples: 'Telefone, E-mail, WhatsApp' },
  { id: 'identificacao', label: 'Identificação', defaultAccessLevel: 'restricted', icon: 'IdCard', examples: 'CPF, RG, Passaporte' },
  { id: 'medico', label: 'Médico', defaultAccessLevel: 'emergency', icon: 'HeartPulse', examples: 'Tipo sanguíneo, Alergias, Plano de saúde' },
  { id: 'endereco', label: 'Endereço', defaultAccessLevel: 'professional', icon: 'MapPin', examples: 'Rua, Cidade, CEP' },
  { id: 'profissional', label: 'Profissional', defaultAccessLevel: 'professional', icon: 'Briefcase', examples: 'Empresa, Cargo, CNPJ' },
  { id: 'financeiro', label: 'Financeiro', defaultAccessLevel: 'restricted', icon: 'CreditCard', examples: 'Banco, Agência, Conta' },
  { id: 'emergencia', label: 'Contato de Emergência', defaultAccessLevel: 'emergency', icon: 'Siren', examples: 'Nome, Telefone, Parentesco' },
  { id: 'veiculo', label: 'Veículo', defaultAccessLevel: 'professional', icon: 'Car', examples: 'Placa, Modelo, Renavam' },
  { id: 'seguro', label: 'Seguro', defaultAccessLevel: 'emergency', icon: 'ShieldCheck', examples: 'Apólice, Seguradora, Vigência' },
  { id: 'educacao', label: 'Educação', defaultAccessLevel: 'professional', icon: 'GraduationCap', examples: 'Instituição, Matrícula, Curso' },
];

export const CUSTOM_CATEGORY_ID = '__custom__';

export function getCategoryById(id: string): CategoryDef | undefined {
  return STANDARD_CATEGORIES.find(c => c.id === id);
}

export function getCategoryLabel(categoryValue: string | null): string {
  if (!categoryValue) return '';
  const found = STANDARD_CATEGORIES.find(c => c.id === categoryValue || c.label === categoryValue);
  return found ? found.label : categoryValue;
}
