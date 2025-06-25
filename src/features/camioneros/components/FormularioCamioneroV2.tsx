import React, { useState } from 'react'
import { User, Phone, Flag, AlertCircle} from 'lucide-react'
import { useForm} from 'react-hook-form'
import { zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog'
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import { Textarea} from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Alert, AlertDescription} from '@/components/ui/alert'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// import { useUserInfo } from '../../../hooks/useAuth'
import { NACIONALIDADES, TIPOS_DOCUMENTO} from '../types'
import type { } from '../types'
// Define the form schema with Zod
const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').trim(),
  apellido: z.string().min(1, 'El apellido es obligatorio').trim(),
  tipoDocumento: z.enum(['CI', 'PASAPORTE', 'DNI'] as const),
  documento: z.string().min(1, 'El documento es obligatorio').trim(),
  nacionalidad: z.enum(['Uruguay', 'Argentina', 'Brasil', 'Paraguay', 'Chile', 'Otro'] as const),
  paisOrigen: z.string().optional(),
  telefonoUruguayo: z.string().optional(),
  telefonoPais: z.string().optional(),
  comentario: z.string().optional(),
}).refine((data) => {
  // At least one phone is required
  return data.telefonoUruguayo || data.telefonoPais
}, {
  message: 'Debe proporcionar al menos un teléfono de contacto',
  path: ['telefonoUruguayo'],
}).refine((data) => {
  // If nacionalidad is 'Otro', paisOrigen is required
  if (data.nacionalidad === 'Otro') {
    return data.paisOrigen && data.paisOrigen.trim().length > 0
  }
  return true
}, {
  message: 'Debe especificar el país',
  path: ['paisOrigen'],
})
type FormData = z.infer<typeof formSchema>
interface FormularioCamioneroProps {
  isOpen: boolean
  onClose: () => void
}

export const FormularioCamioneroV2: React.FC<FormularioCamioneroProps> = ({ isOpen, onClose }) => {
  // const userInfo = useUserInfo()
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      documento: '',
      tipoDocumento: 'CI',
      nacionalidad: 'Uruguay',
      paisOrigen: '',
      telefonoUruguayo: '',
      telefonoPais: '',
      comentario: '',
    },
  })
  const handleSubmit = async (data: FormData) => {
    setLoading(true)
    setGeneralError(null)
    try {
      // Mock createCamionero function
      interface CamioneroData {
        nombre: string;
        apellido: string;
        documento: string;
        tipoDocumento: string;
        nacionalidad: string;
        paisOrigen: string;
        telefonoUruguayo: string;
        telefonoPais: string;
        comentario: string;
        creadoPor: {
          id: string | number;
          nombre: string;
        };
      }
      const createCamionero = async (data: CamioneroData) => {
        console.log('Creating camionero:', data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      };
      
      await createCamionero({
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        documento: data.documento.trim(),
        tipoDocumento: data.tipoDocumento,
        nacionalidad: data.nacionalidad,
        paisOrigen: data.nacionalidad === 'Otro' ? data.paisOrigen?.trim() || '' : data.nacionalidad,
        telefonoUruguayo: data.telefonoUruguayo?.trim() || '',
        telefonoPais: data.telefonoPais?.trim() || '',
        comentario: data.comentario?.trim() || '',
        creadoPor: {
          id: 'user-1',
          nombre: 'Current User'
        }
      })
      form.reset()
      onClose()
    } catch {
      setGeneralError('Error al registrar el camionero')
    } finally {
      setLoading(false)
    }
  }
  const nacionalidadValue = form.watch('nacionalidad')
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-blue-500" />
            Registrar Camionero
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {generalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={(field ) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Juan"
                        className="bg-gray-800 border-gray-700"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellido"
                render={(field ) => (
                  <FormItem>
                    <FormLabel>Apellido *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Pérez"
                        className="bg-gray-800 border-gray-700"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tipoDocumento"
                render={(field ) => (
                  <FormItem>
                    <FormLabel>Tipo de documento *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TIPOS_DOCUMENTO).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documento"
                render={(field ) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Número de documento *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 12345678"
                        className="bg-gray-800 border-gray-700"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nacionalidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nacionalidad"
                render={(field ) => (
                  <FormItem>
                    <FormLabel>Nacionalidad *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(NACIONALIDADES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {nacionalidadValue === 'Otro' && (<FormField
                  control={form.control}
                  name="paisOrigen"
                  render={(field ) => (
                    <FormItem>
                      <FormLabel>Especificar país *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Perú"
                          className="bg-gray-800 border-gray-700"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Teléfonos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefonoUruguayo"
                render={(field ) => (
                  <FormItem>
                    <FormLabel>
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Teléfono uruguayo
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Ej: 099123456"
                        className="bg-gray-800 border-gray-700"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-xs">
                      Debe proporcionar al menos un teléfono
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefonoPais"
                render={(field ) => (
                  <FormItem>
                    <FormLabel>
                      <span className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        Teléfono del país de origen
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Ej: +541123456789"
                        className="bg-gray-800 border-gray-700"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Comentarios */}
            <FormField
              control={form.control}
              name="comentario"
              render={(field ) => (
                <FormItem>
                  <FormLabel>Comentarios / Observaciones (__opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Chofer de confianza, siempre puntual..."
                      rows={3}
                      className="bg-gray-800 border-gray-700 resize-none"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}