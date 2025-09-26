"use client"

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, User, Mail, Lock } from 'lucide-react'

export default function AuthForm() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00FF88]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00FF88]/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-2xl shadow-[#00FF88]/10">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-[#00FF88]/20 to-emerald-500/20 rounded-2xl backdrop-blur-sm border border-[#00FF88]/20">
                <Sparkles className="w-12 h-12 text-[#00FF88]" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Dashboard Financeiro
              </CardTitle>
              <p className="text-gray-400 text-lg">
                Entre para gerenciar suas finanças
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#00FF88',
                      brandAccent: '#00E57A',
                      brandButtonText: 'black',
                      defaultButtonBackground: 'transparent',
                      defaultButtonBackgroundHover: 'rgba(55, 65, 81, 0.5)',
                      defaultButtonBorder: 'rgba(55, 65, 81, 0.5)',
                      defaultButtonText: 'white',
                      dividerBackground: 'rgba(55, 65, 81, 0.3)',
                      inputBackground: 'rgba(31, 41, 55, 0.5)',
                      inputBorder: 'rgba(55, 65, 81, 0.5)',
                      inputBorderHover: 'rgba(0, 255, 136, 0.5)',
                      inputBorderFocus: '#00FF88',
                      inputText: 'white',
                      inputLabelText: 'rgba(209, 213, 219, 1)',
                      inputPlaceholder: 'rgba(156, 163, 175, 1)',
                      messageText: 'white',
                      messageTextDanger: '#EF4444',
                      anchorTextColor: '#00FF88',
                      anchorTextHoverColor: '#00E57A',
                    },
                    space: {
                      spaceSmall: '4px',
                      spaceMedium: '8px',
                      spaceLarge: '16px',
                      labelBottomMargin: '8px',
                      anchorBottomMargin: '4px',
                      emailInputSpacing: '4px',
                      socialAuthSpacing: '4px',
                      buttonPadding: '10px 15px',
                      inputPadding: '10px 15px',
                    },
                    fontSizes: {
                      baseBodySize: '14px',
                      baseInputSize: '14px',
                      baseLabelSize: '14px',
                      baseButtonSize: '14px',
                    },
                    fonts: {
                      bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                      buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                      inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                      labelFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '8px',
                      buttonBorderRadius: '8px',
                      inputBorderRadius: '8px',
                    },
                  },
                },
                className: {
                  anchor: 'text-[#00FF88] hover:text-[#00E57A] transition-colors duration-300',
                  button: 'bg-gradient-to-r from-[#00FF88] to-emerald-400 hover:from-[#00E57A] hover:to-emerald-300 text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#00FF88]/25',
                  container: 'space-y-4',
                  divider: 'bg-gray-700/30',
                  input: 'bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 focus:border-[#00FF88] transition-colors duration-300',
                  label: 'text-gray-200 font-medium',
                  loader: 'border-[#00FF88]',
                  message: 'text-white',
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'Seu email',
                    password_input_placeholder: 'Sua senha',
                    button_label: 'Entrar',
                    loading_button_label: 'Entrando...',
                    social_provider_text: 'Entrar com {{provider}}',
                    link_text: 'Já tem uma conta? Entre aqui',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'Seu email',
                    password_input_placeholder: 'Sua senha',
                    button_label: 'Criar conta',
                    loading_button_label: 'Criando conta...',
                    social_provider_text: 'Criar conta com {{provider}}',
                    link_text: 'Não tem uma conta? Crie aqui',
                    confirmation_text: 'Verifique seu email para confirmar a conta',
                  },
                  magic_link: {
                    email_input_label: 'Email',
                    email_input_placeholder: 'Seu email',
                    button_label: 'Enviar link mágico',
                    loading_button_label: 'Enviando link...',
                    link_text: 'Enviar um link mágico por email',
                    confirmation_text: 'Verifique seu email para o link de acesso',
                  },
                  forgotten_password: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'Seu email',
                    button_label: 'Enviar instruções',
                    loading_button_label: 'Enviando instruções...',
                    link_text: 'Esqueceu sua senha?',
                    confirmation_text: 'Verifique seu email para redefinir a senha',
                  },
                  update_password: {
                    password_label: 'Nova senha',
                    password_input_placeholder: 'Sua nova senha',
                    button_label: 'Atualizar senha',
                    loading_button_label: 'Atualizando senha...',
                    confirmation_text: 'Sua senha foi atualizada',
                  },
                  verify_otp: {
                    email_input_label: 'Email',
                    email_input_placeholder: 'Seu email',
                    phone_input_label: 'Telefone',
                    phone_input_placeholder: 'Seu telefone',
                    token_input_label: 'Token',
                    token_input_placeholder: 'Seu token',
                    button_label: 'Verificar token',
                    loading_button_label: 'Verificando...',
                  },
                },
              }}
              providers={[]}
              redirectTo={typeof window !== 'undefined' ? window.location.origin : undefined}
            />
            
            <div className="text-center space-y-2 pt-4 border-t border-gray-700/30">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Lock className="w-4 h-4" />
                <span>Seus dados estão seguros e criptografados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}