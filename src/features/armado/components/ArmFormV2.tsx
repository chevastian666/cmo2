// @ts-nocheck
import React, { useEffect } from 'react'
import { useForm} from 'react-hook-form'
import { zodResolver} from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Truck, User, Phone, Hash, Package} from 'lucide-react'
import { ORIGENES_DESTINOS } from '../../../constants/locations'
// shadcn/ui components
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import { Textarea} from '@/components/ui/textarea'
import { Checkbox} from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
// Empresas con RUT
const EMPRESAS = [
  { nombre: 'Transportes del Sur S.A.', rut: '211234567890' },
  { nombre: 'Logística Oriental S.R.L.', rut: '212345678901' },
  { nombre: 'Cargas del Norte S.A.', rut: '213456789012' },
  { nombre: 'Transporte Internacional Uruguay', rut: '214567890123' },
  { nombre: 'Rutas del Este S.A.', rut: '215678901234' },
  { nombre: 'Camiones del Oeste Ltda.', rut: '216789012345' },
  { nombre: 'Fletes Nacionales S.A.', rut: '217890123456' },
  { nombre: 'Transportadora Central', rut: '218901234567' },
  { nombre: 'Logística Integral Uruguay', rut: '219012345678' },
  { nombre: 'Express Cargo S.R.L.', rut: '210123456789' }
]
// Form validation schema
const formSchema = z.object({
  matricula: z.string().min(1, 'La matrícula es requerida'),
  nombreConductor: z.string().min(1, 'El nombre del conductor es requerido'),
  telefonoConductor: z.string().min(1, 'El teléfono es requerido'),
  empresa: z.string().min(1, 'La empresa es requerida'),
  rutEmpresa: z.string().min(12, 'El RUT debe tener 12 dígitos').max(12),
  origen: z.string().min(1, 'El origen es requerido'),
  destino: z.string().min(1, 'El destino es requerido'),
  tipoEslinga: z.object({
    larga: z.boolean(),
    corta: z.boolean(),
  }).refine(data => data.larga || data.corta, {
    message: "Debe seleccionar al menos un tipo de eslinga",
  }),
  precintoId: z.string().min(1, 'El ID del precinto es requerido'),
  observaciones: z.string().optional(),
})
type FormData = z.infer<typeof formSchema>
interface ArmFormV2Props {
  data: Partial<FormData>
  onChange: (field: string, value: unknown) => void
  disabled?: boolean
  precintoId?: string
  onSubmit?: (data: FormData) => void
}

export const ArmFormV2: React.FC<ArmFormV2Props> = ({ 
  data, onChange, disabled = false, precintoId, onSubmit 
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matricula: data.matricula || '',
      nombreConductor: data.nombreConductor || '',
      telefonoConductor: data.telefonoConductor || '',
      empresa: data.empresa || '',
      rutEmpresa: data.rutEmpresa || '',
      origen: data.origen || '',
      destino: data.destino || '',
      tipoEslinga: data.tipoEslinga || { larga: false, corta: false },
      precintoId: data.precintoId || precintoId || '',
      observaciones: data.observaciones || '',
    },
  })
  // Watch form changes and propagate to parent
  const watchedValues = form.watch()
  useEffect(() => {
    Object.entries(watchedValues).forEach(([key, value]) => {
      if (JSON.stringify(data[key as keyof FormData]) !== JSON.stringify(value)) {
        onChange(key, value)
      }
    })
  }, [watchedValues, data, onChange])
  // Auto-complete precinto ID when provided

  useEffect(() => {
    if (precintoId && form.getValues('precintoId') !== precintoId) {
      form.setValue('precintoId', precintoId)
    }
  }, [precintoId, form])
  // Auto-complete RUT when empresa is selected
  const selectedEmpresa = form.watch('empresa')
  useEffect(() => {
    if (selectedEmpresa) {
      const empresa = EMPRESAS.find(e => e.nombre === selectedEmpresa)
      if (empresa) {
        form.setValue('rutEmpresa', empresa.rut)
      }
    }
  }, [selectedEmpresa, form])
  const handleSubmit = (data: FormData) => {
    if (onSubmit) {
      onSubmit(data)
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Datos del Tránsito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehículo y Conductor */}
            <div>
              <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Vehículo y Conductor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="matricula"
                  render={(field ) => (
                    <FormItem>
                      <FormLabel>Matrícula del Camión *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            disabled={disabled}
                            placeholder="UY-1234"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nombreConductor"
                  render={(field ) => (
                    <FormItem>
                      <FormLabel>Nombre del Conductor *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            disabled={disabled}
                            placeholder="Juan Pérez"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefonoConductor"
                  render={(field ) => (
                    <FormItem>
                      <FormLabel>Teléfono del Conductor *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="tel"
                            disabled={disabled}
                            placeholder="099 123 456"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Empresa */}
            <div>
              <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="empresa"
                  render={(field ) => (<FormItem>
                      <FormLabel>Empresa *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar empresa..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPRESAS.map((empresa) => (
                            <SelectItem key={empresa.rut} value={empresa.nombre}>
                              {empresa.nombre}
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
                  name="rutEmpresa"
                  render={(field ) => (
                    <FormItem>
                      <FormLabel>RUT de la Empresa *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            disabled={disabled}
                            placeholder="211234567890"
                            className="pl-10"
                            maxLength={12}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Ruta */}
            <div>
              <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Ruta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origen"
                  render={(field ) => (<FormItem>
                      <FormLabel>Origen *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar origen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORIGENES_DESTINOS.map((_location) => (
                            <SelectItem key={location.value} value={location.value}>
                              {location.label}
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
                  name="destino"
                  render={(field ) => (<FormItem>
                      <FormLabel>Destino *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar destino..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORIGENES_DESTINOS.map((_location) => (
                            <SelectItem key={location.value} value={location.value}>
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Precinto y Eslinga */}
            <div>
              <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Precinto y Eslinga
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="precintoId"
                  render={(field ) => (
                    <FormItem>
                      <FormLabel>ID del Precinto *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            disabled={disabled || !!precintoId}
                            placeholder="PREC-123456"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoEslinga"
                  render={() => (<FormItem>
                      <FormLabel>Tipo de Eslinga *</FormLabel>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="tipoEslinga.larga"
                          render={(field ) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={disabled}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">
                                  Eslinga Larga (Para contenedores)
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tipoEslinga.corta"
                          render={(field ) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={disabled}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">
                                  Eslinga Corta (Para puertas)
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Observaciones
              </h3>
              <FormField
                control={form.control}
                name="observaciones"
                render={(field ) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={disabled}
                        placeholder="Observaciones adicionales..."
                        rows={3}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {onSubmit && (
              <div className="flex justify-end">
                <Button type="submit" disabled={disabled}>
                  Guardar Tránsito
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}