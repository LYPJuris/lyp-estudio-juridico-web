import { Hammer, Users, FileText, Heart, Shield, Clock, Star, Phone, Mail, MapPin, MessageSquare, Zap, Award, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { sanitizeInput, validateEmail, validatePhone, validateName, formRateLimiter, generateFingerprint } from "@/utils/security";
const Index = () => {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    area: 'Derecho de Familia',
    caso: ''
  });
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    email: '',
    telefono: '',
    caso: ''
  });
  const validateForm = (): boolean => {
    const errors = {
      nombre: '',
      email: '',
      telefono: '',
      caso: ''
    };

    // Validate name
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (!validateName(formData.nombre)) {
      errors.nombre = 'El nombre solo puede contener letras, espacios y guiones';
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Por favor ingresa un email válido';
    }

    // Validate phone
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!validatePhone(formData.telefono)) {
      errors.telefono = 'Por favor ingresa un número de teléfono chileno válido';
    }

    // Validate case description
    if (!formData.caso.trim()) {
      errors.caso = 'La descripción del caso es requerida';
    } else if (formData.caso.length < 10) {
      errors.caso = 'Por favor proporciona más detalles sobre tu caso';
    } else if (formData.caso.length > 1000) {
      errors.caso = 'La descripción es muy larga (máximo 1000 caracteres)';
    }
    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;

    // Sanitize input to prevent XSS
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleAgendarConsulta = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Error en el formulario",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    const fingerprint = generateFingerprint();
    if (!formRateLimiter.isAllowed(fingerprint)) {
      const remainingTime = formRateLimiter.getRemainingTime(fingerprint);
      toast({
        title: "Demasiados intentos",
        description: `Por favor espera ${remainingTime} segundos antes de intentar nuevamente`,
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Additional sanitization before creating email
      const sanitizedData = {
        nombre: sanitizeInput(formData.nombre),
        email: sanitizeInput(formData.email),
        telefono: sanitizeInput(formData.telefono),
        area: sanitizeInput(formData.area),
        caso: sanitizeInput(formData.caso)
      };
      const subject = `Solicitud de asistencia jurídica - ${sanitizedData.area}`;
      const body = `Buenas tardes, mi nombre es ${sanitizedData.nombre}, y vengo a solicitar asistencia jurídica respecto a ${sanitizedData.caso}.

Mi número de teléfono es: ${sanitizedData.telefono}
Mi email es: ${sanitizedData.email}

Quedo atento a su respuesta.

Saludos cordiales.`;
      const mailtoLink = `mailto:lyp.juridico@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Use a more secure way to open mailto
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Consulta enviada",
        description: "Tu solicitud ha sido enviada correctamente. Te contactaremos pronto."
      });

      // Reset form after successful submission
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        area: 'Derecho de Familia',
        caso: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu consulta. Por favor intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Número copiado al portapapeles"
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Copiado",
        description: "Número copiado al portapapeles"
      });
    }
  };
  return <div className="min-h-screen bg-white">
      {/* Header/Hero Section */}
      <header className="relative bg-gradient-to-r from-slate-900 to-slate-700 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-60">
          <img src="/lovable-uploads/1ef3bbbc-c9a5-4525-820f-738c55940b9e.png" alt="Abogados especialistas en derecho de familia y civil en Chile - Martillo de la justicia" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 to-slate-700/20"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/570e51e1-4b6e-4d2f-aa3f-ad2b551f7fe3.png" 
                alt="L&P Estudio Jurídico Logo" 
                className="h-48 md:h-64 mb-2"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">LABRA & PÉREZ ESTUDIO JURÍDICO</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">Soluciones jurídicas claras y efectivas en Derecho Civil y Familia, aquí en la Región de Los Lagos.</p>
            <p className="text-lg mb-10 text-gray-300">Avalan nuestra experiencia múltiples sentencias favorables</p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg shadow-lg transition-all hover:scale-105" onClick={() => document.getElementById('contacto')?.scrollIntoView({
            behavior: 'smooth'
          })}>
              Agenda tu consulta gratuita
            </Button>
          </div>
        </div>
      </header>

      {/* Quiénes Somos Section */}
      <section className="py-16 bg-gray-50" aria-labelledby="quienes-somos">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="quienes-somos" className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Quiénes Somos</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h3 className="text-2xl font-semibold text-slate-800 mb-4">Expertos en Derecho de Familia y Civil</h3>
                <p className="text-gray-700 mb-4 font-normal text-base text-justify">Somos un equipo de abogados con una vasta trayectoria en Derecho de Familia y Civil. Fuimos los mejores de nuestras promociones y, gracias a nuestra experiencia, alcanzamos soluciones efectivas y sentencias favorables que protegen tus derechos.</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Sentencias favorables garantizadas</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Procesos ágiles y efectivos</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Honorarios transparentes y orientados al éxito</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold text-slate-800 mb-4">Nuestros Valores</h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Honestidad y Ética profesional</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Compromiso pleno en el caso</span>
                  </li>
                  <li className="flex items-start">
                    <Star className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Excelencia en el servicio</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Orientación al cliente</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Destacados */}
      <main>
        <section className="bg-white py-[64px]" aria-labelledby="servicios">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="servicios" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Nuestros Servicios</h2>
            <p className="text-gray-600 text-lg">Protegemos tus derechos en la Región de Los Lagos y Los Ríos, con experiencia en tribunales locales.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Derecho de Familia */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-blue-600 mr-4" />
                  <h3 className="text-2xl font-semibold text-slate-800">Derecho de Familia</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>• Divorcios unilaterales y de común acuerdo</li>
                  <li>• Pensiones alimenticias</li>
                  <li>• Cuidado personal</li>
                  <li>• Régimen comunicacional</li>
                  <li>• Reclamación de paternidad</li>
                  <li>• Suspensión de patria potestad</li>
                </ul>
                <p className="mt-4 text-gray-600">
                  Te acompañamos en los momentos más importantes de tu vida familiar con sensibilidad y profesionalismo.
                </p>
              </CardContent>
            </Card>

            {/* Derecho Civil */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <FileText className="w-8 h-8 text-blue-600 mr-4" />
                  <h3 className="text-2xl font-semibold text-slate-800">Derecho Civil</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>• Escrituras (contratos, constitución de sociedades)</li>
                  <li>• Indemnización de perjuicios</li>
                  <li>• Juicios de arriendo</li>
                  <li>• Posesión efectiva y herencias</li>
                  <li>• Cambios de nombre</li>
                  <li>• Interdicciones por demencia</li>
                  <li>• Insolvencia de la Ley N° 20.720</li>
                </ul>
                <p className="mt-4 text-gray-600">
                  Protegemos tus intereses patrimoniales con estrategias efectivas y personalizadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </section>
      </main>

      {/* Testimonios */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Casos de Éxito</h2>
            <p className="text-gray-600 text-lg">La satisfacción de nuestros clientes nos respalda</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">Lograron resolver mi divorcio en tiempo récord y con los mejores términos posibles. Su atención fue excepcional y siempre me mantuvieron informada del proceso.</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold">MC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">María C.</p>
                    <p className="text-sm text-gray-600">Divorcio de común acuerdo
                  </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">Obtuve la pensión alimenticia que me correspondía después de años de problemas. Su dedicación y conocimiento fueron fundamentales para el éxito del caso.</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold">TB</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Trinidad B.</p>
                    <p className="text-sm text-gray-600">Alimentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ventajas Competitivas */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por Qué Elegirnos?</h2>
            <p className="text-blue-100 text-lg">Ventajas que transforman tu caso en un éxito</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Respuesta Rápida</h3>
              <p className="text-blue-100">Análisis detallado de tu caso y plan de acción en menos de 24 horas, para que sepas exactamente qué pasos damos.</p>
            </div>
            
            <div className="text-center">
              <Award className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Resultados Comprobados</h3>
              <p className="text-blue-100">Años de sentencias favorables que avalan nuestra experiencia: tu derecho siempre protegido.</p>
            </div>
            
            <div className="text-center">
              <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Atención a tu Medida</h3>            <p className="text-blue-100 text-lg">Atendemos online en la Región de Los Lagos y Los Ríos.</p>        </div>
          </div>
        </div>
      </section>

      {/* Formulario de Contacto */}
      <section id="contacto" className="relative py-16 overflow-hidden">
        {/* Background Image with Blue Gradient */}
        <div className="absolute inset-0">
          <img src="/lovable-uploads/3b4b0811-51da-4b12-bf38-dff35c41b9d0.png" alt="Abogado especialista L&P Estudio Jurídico revisando documentos legales en Chile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 to-blue-600/75"></div>
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Agenda tu Consulta Gratuita</h2>
              <p className="text-blue-100 text-lg">Cuéntanos tu caso y te daremos una orientación inicial</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Formulario */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8">
                  <form className="space-y-6" onSubmit={handleAgendarConsulta}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                      <Input name="nombre" placeholder="Tu nombre completo" className={`w-full ${formErrors.nombre ? 'border-red-500' : ''}`} value={formData.nombre} onChange={handleInputChange} required />
                      {formErrors.nombre && <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input name="email" type="email" placeholder="tu.email@ejemplo.com" className={`w-full ${formErrors.email ? 'border-red-500' : ''}`} value={formData.email} onChange={handleInputChange} required />
                      {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <Input name="telefono" placeholder="+56 9 1234 5678" className={`w-full ${formErrors.telefono ? 'border-red-500' : ''}`} value={formData.telefono} onChange={handleInputChange} required />
                      {formErrors.telefono && <p className="text-red-500 text-sm mt-1">{formErrors.telefono}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Área de consulta</label>
                      <select name="area" className="w-full p-3 border border-gray-300 rounded-md" value={formData.area} onChange={handleInputChange}>
                        <option>Derecho de Familia</option>
                        <option>Derecho Civil</option>
                        <option>Consulta general</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Describe tu caso</label>
                      <Textarea name="caso" placeholder="Cuéntanos brevemente tu situación..." className={`w-full h-32 ${formErrors.caso ? 'border-red-500' : ''}`} value={formData.caso} onChange={handleInputChange} required maxLength={1000} />
                      {formErrors.caso && <p className="text-red-500 text-sm mt-1">{formErrors.caso}</p>}
                      <p className="text-gray-500 text-sm mt-1">{formData.caso.length}/1000 caracteres</p>
                    </div>
                    
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 disabled:opacity-50" disabled={isSubmitting}>
                      {isSubmitting ? 'Enviando...' : 'Agendar consulta'}
                    </Button>
                  </form>
                  
                  {/* WhatsApp Contact Box */}
                  <a href="https://wa.me/56977646224?text=Hola,%20me%20gustaría%20solicitar%20una%20consulta." target="_blank" rel="noopener noreferrer" className="mt-6 w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10 transition-colors duration-300">
                    <MessageSquare className="w-6 h-6 mr-3" />
                    Chatear por WhatsApp
                  </a>
                </CardContent>
              </Card>
              
              {/* Información de contacto */}
              <div className="space-y-6">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Información de Contacto</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">WhatsApp</p>
                          <p className="text-gray-600">+56 9 7764 6224</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-gray-600">lyp.juridico@gmail.com</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Horarios de Atención</h3>
                    <div className="space-y-2 text-gray-700">
                      <p>Lunes a Viernes: 9:00 - 18:00</p>
                      
                      <p>Vía WhatsApp o correo electrónico</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Atención Local, Resultados Reales</h3>
                    <div className="space-y-2 text-gray-700">
                      <p>Trabajamos en la Región de Los Lagos y Región de Los Ríos: Puerto Montt, Puerto Varas, Osorno, Valdivia. </p>
                      <p className="font-medium">Sabemos cómo se resuelven los casos aquí… y cómo ganar el tuyo.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                
                <h3 className="text-xl font-bold">LABRA & PÉREZ ESTUDIO JURÍDICO</h3>
              </div>
              <p className="text-gray-400 mb-4">Soluciones legales confiables en Derecho Civil y de Familia</p>
            </div>
            
            
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Áreas de Práctica</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Derecho de Familia</li>
                  <li>Sucesiones y herencias</li>
                  <li>Divorcios</li>
                  <li>Pensiones Alimenticias</li>
                  <li>Contratos</li>
                  <li>Indemnizaciones</li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/570e51e1-4b6e-4d2f-aa3f-ad2b551f7fe3.png" 
                  alt="L&P Estudio Jurídico Logo" 
                  className="h-24 md:h-32 opacity-80"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 | LABRA & PÉREZ ESTUDIO JURÍDICO. | Todos los derechos reservados. </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;
