
import React from 'react';
import { ArrowLeftIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface LegalPageProps {
  type: 'terms' | 'privacy';
  onBack: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
  const content = type === 'terms' ? {
    title: 'Termos de Uso',
    icon: <DocumentTextIcon className="h-12 w-12 text-blue-500" />,
    description: 'Leia atentamente nossos termos antes de usar a plataforma.',
    sections: [
      {
        title: '1. Aceitação dos Termos',
        text: 'Ao acessar o CyBerPhone, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.'
      },
      {
        title: '2. Uso de Licença',
        text: 'É concedida permissão para carregar temporariamente uma cópia dos materiais na rede social CyBerPhone apenas para visualização transitória pessoal e não comercial.'
      },
      {
        title: '3. Isenção de Responsabilidade',
        text: 'Os materiais no site da CyBerPhone são fornecidos "como estão". CyBerPhone não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias.'
      },
      {
        title: '4. Conteúdo do Usuário',
        text: 'Você mantém todos os direitos de propriedade sobre o conteúdo que publica. No entanto, ao publicar conteúdo, você concede à CyBerPhone uma licença mundial e não exclusiva para usar, hospedar e distribuir esse conteúdo.'
      }
    ]
  } : {
    title: 'Política de Privacidade',
    icon: <ShieldCheckIcon className="h-12 w-12 text-green-500" />,
    description: 'Sua privacidade é nossa prioridade absoluta.',
    sections: [
      {
        title: '1. Informações que Coletamos',
        text: 'Coletamos informações que você nos fornece diretamente ao criar uma conta, como seu nome, e-mail, data de nascimento e foto de perfil.'
      },
      {
        title: '2. Como Usamos seus Dados',
        text: 'Utilizamos seus dados para fornecer e melhorar nossos serviços, personalizar sua experiência e garantir a segurança da rede contra conteúdos ilícitos.'
      },
      {
        title: '3. Compartilhamento de Dados',
        text: 'Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para cumprir obrigações legais ou com o seu consentimento explícito.'
      },
      {
        title: '4. Segurança',
        text: 'Implementamos medidas de segurança de ponta para proteger seus dados contra acesso não autorizado, alteração ou destruição.'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0c10] py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#12161f] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-8 md:p-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Voltar
          </button>

          <div className="text-center mb-12">
            <div className="flex justify-center mb-4 opacity-80">
              {content.icon}
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">{content.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{content.description}</p>
          </div>

          <div className="space-y-8">
            {content.sections.map((section, idx) => (
              <div key={idx} className="border-b border-gray-100 dark:border-white/5 pb-8 last:border-0">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Última atualização: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
