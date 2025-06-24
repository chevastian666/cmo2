import React from 'react'
import { Button} from './button'
import { Input} from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { AlertCircle, Check, X, ArrowRight, User, Table } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle} from './Card'
import { Alert, AlertDescription, AlertTitle} from './alert'
import { FormularioCamioneroV2} from '../../features/camioneros/components/FormularioCamioneroV2'
import { PrecintosTableV2} from '../../features/precintos/components/PrecintosTableV2'
import { VerificarAlertaModalV2} from '../../features/alertas/components/VerificarAlertaModalV2'
import { EditTransitoModalV2} from '../../features/transitos/components/EditTransitoModalV2'
import { Label} from './label'
import { Checkbox} from './checkbox'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Switch} from './switch'
import {
  Popover, PopoverContent, PopoverTrigger } from './popover'
import { Info} from 'lucide-react'
import { Skeleton} from './skeleton'
import { CardSkeleton, ListItemSkeleton, FormSkeleton} from './CardSkeleton'
import { BreadcrumbNav} from './BreadcrumbNav'
import { NetworkChartV2} from '../../features/dashboard/components/NetworkChartV2'
// Mock data for demos
const mockAlerta = {
  id: '1',
  tipo: 'temperatura',
  severidad: 'critica',
  codigoPrecinto: 'BT20240001',
  mensaje: 'Temperatura fuera de rango',
  timestamp: new Date(),
  ubicacion: { lat: -34.9011, lng: -56.1645 },
  atendida: false
}
const mockTransito = {
  id: '1',
  precinto: 'BT20240001',
  estado: 'EN_RUTA',
  origen: 'Montevideo',
  destino: 'Rivera',
  fechaSalida: new Date(),
  eta: new Date(Date.now() + 5 * 60 * 60 * 1000),
  empresa: 'Transportes Uruguay',
  dua: '123456'
}
export default function ShadcnDemo() {
  const [open, setOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [tableOpen, setTableOpen] = React.useState(false)
  const [loadingDemo, setLoadingDemo] = React.useState(false)
  const [verificarOpen, setVerificarOpen] = React.useState(false)
  const [editTransitoOpen, setEditTransitoOpen] = React.useState(false)
  return (<>
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold mb-8">shadcn/ui Components Demo</h1>

      {/* Buttons Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Check className="mr-2 h-4 w-4" /> With Icon
          </Button>
        </div>
      </section>

      {/* Input Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Input Fields</h2>
        <div className="max-w-md space-y-4">
          <Input type="text" placeholder="Default input" />
          <Input type="email" placeholder="Email input" />
          <Input type="password" placeholder="Password input" />
          <Input type="number" placeholder="Number input" />
          <Input disabled placeholder="Disabled input" />
          <div className="relative">
            <Input type="search" placeholder="Search..." className="pl-8" />
            <AlertCircle className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Select Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Select</h2>
        <div className="max-w-md space-y-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
              <SelectItem value="option4">Option 4</SelectItem>
            </SelectContent>
          </Select>

          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Disabled select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Dialog Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Dialog</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Alert Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Alerts</h2>
        <div className="space-y-4 max-w-2xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components to your app using the cli.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Card Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Transits</CardTitle>
              <CardDescription>Currently monitored shipments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Critical Alerts</CardTitle>
              <CardDescription>Requires immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">3</div>
              <p className="text-xs text-muted-foreground">
                2 unassigned, 1 pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Overall system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-lg font-medium">Operational</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All systems running normally
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Form Controls Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Form Controls</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>

              {/* Radio Group */}
              <div className="space-y-2">
                <Label>Notification Preferences</Label>
                <RadioGroup defaultValue="all">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical">Critical only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">None</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Switch */}
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Enable real-time updates</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Complex Form Example */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Complex Form with Validation</h2>
        <Card>
          <CardHeader>
            <CardTitle>React Hook Form + Zod + shadcn/ui</CardTitle>
            <CardDescription>
              Example of a comprehensive form with validation, conditional fields, and error handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
              <User className="mr-2 h-4 w-4" />
              Open Driver Registration Form
            </Button>
          </CardContent>
        </Card>
        <FormularioCamioneroV2 isOpen={formOpen} onClose={() => setFormOpen(false)} />
      </section>

      {/* Popover Example */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Popovers & Tooltips</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Info className="mr-2 h-4 w-4" />
                    Información
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Popover Component</h4>
                      <p className="text-sm text-muted-foreground">
                        Los popovers son útiles para mostrar información adicional sin saturar la interfaz.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="width">Width</Label>
                        <Input
                          id="width"
                          defaultValue="100%"
                          className="col-span-2 h-8"
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="maxWidth">Max. width</Label>
                        <Input
                          id="maxWidth"
                          defaultValue="300px"
                          className="col-span-2 h-8"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button>Configuración Rápida</Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="grid gap-4">
                    <h4 className="font-medium leading-none">Configuración</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="notifications" />
                        <Label htmlFor="notifications">Notificaciones</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="sound" />
                        <Label htmlFor="sound">Sonido</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="updates" />
                        <Label htmlFor="updates">Actualizaciones automáticas</Label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Data Table Example */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Data Table with Sorting & Filtering</h2>
        <Card>
          <CardHeader>
            <CardTitle>Advanced Data Table</CardTitle>
            <CardDescription>
              Tabla completa con ordenamiento, filtrado, paginación y acciones con popovers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={tableOpen} onOpenChange={setTableOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Table className="mr-2 h-4 w-4" />
                  Ver Tabla de Precintos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Gestión de Precintos</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <PrecintosTableV2 />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </section>

      {/* Skeleton Loaders */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Skeleton Loaders</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>
                Skeleton loaders para mejorar la experiencia durante la carga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Basic Skeletons</h4>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Card Skeleton</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <CardSkeleton />
                    <CardSkeleton showDescription={false} />
                    <CardSkeleton showChart />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">List Item Skeleton</h4>
                  <div className="space-y-2">
                    <ListItemSkeleton />
                    <ListItemSkeleton />
                    <ListItemSkeleton />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Form Skeleton</h4>
                  <FormSkeleton />
                </div>

                <div>
                  <Button 
                    onClick={() => {
                      setLoadingDemo(true)
                      setTimeout(() => setLoadingDemo(false), 3000)
                    }}
                    disabled={loadingDemo}
                  >
                    {loadingDemo ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Loading Table...
                      </>
                    ) : (
                      'Simulate Loading'
                    )}
                  </Button>
                  
                  {loadingDemo && (
                    <Dialog open={loadingDemo} onOpenChange={setLoadingDemo}>
                      <DialogContent className="max-w-6xl">
                        <DialogHeader>
                          <DialogTitle>Loading Data...</DialogTitle>
                        </DialogHeader>
                        <PrecintosTableV2 loading={true} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Migration Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Migration Examples</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Components Ready for Migration</CardTitle>
              <CardDescription>
                These components have been migrated to shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">PrecintosTableV2</h4>
                    <p className="text-sm text-muted-foreground">
                      Data table con ordenamiento, filtrado, paginación y popovers
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setTableOpen(true)}>
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">FormularioCamioneroV2</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete form with react-hook-form, Zod validation, and shadcn/ui
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">TransitoDetailModalV2</h4>
                    <p className="text-sm text-muted-foreground">
                      Complex modal with map integration and timeline controls
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">ResponderAlertaModalV2</h4>
                    <p className="text-sm text-muted-foreground">
                      Alert response modal with command buttons
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">AlertaDetalleModalV2</h4>
                    <p className="text-sm text-muted-foreground">
                      Alert detail modal with Dialog component
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">AlertsTableV2</h4>
                    <p className="text-sm text-muted-foreground">
                      Alerts table with shadcn/ui Buttons and Badges
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">VerificarAlertaModalV2</h4>
                    <p className="text-sm text-muted-foreground">
                      Alert verification modal with status badges and actions
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setVerificarOpen(true)}>
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">EditTransitoModalV2</h4>
                    <p className="text-sm text-muted-foreground">
                      Edit transit modal with form validation
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setEditTransitoOpen(true)}>
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">LoginPage</h4>
                    <p className="text-sm text-muted-foreground">
                      Login form with shadcn/ui components
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Breadcrumb Example */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Breadcrumb Navigation</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Breadcrumb navigation is automatically added to all pages. Example:
            </p>
            <div className="bg-gray-900 rounded-lg p-4">
              <BreadcrumbNav />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Chart Components */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Chart Components</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <NetworkChartV2
            data={[
              { timestamp: Math.floor(Date.now() / 1000) - 3600, value: 45 },
              { timestamp: Math.floor(Date.now() / 1000) - 3000, value: 52 },
              { timestamp: Math.floor(Date.now() / 1000) - 2400, value: 48 },
              { timestamp: Math.floor(Date.now() / 1000) - 1800, value: 65 },
              { timestamp: Math.floor(Date.now() / 1000) - 1200, value: 72 },
              { timestamp: Math.floor(Date.now() / 1000) - 600, value: 68 },
              { timestamp: Math.floor(Date.now() / 1000), value: 85 }
            ]}
            title="Tránsitos Activos"
            type="line"
            color="#3B82F6"
          />
          <NetworkChartV2
            data={[
              { timestamp: Math.floor(Date.now() / 1000) - 3600, cantidad: 12 },
              { timestamp: Math.floor(Date.now() / 1000) - 3000, cantidad: 18 },
              { timestamp: Math.floor(Date.now() / 1000) - 2400, cantidad: 15 },
              { timestamp: Math.floor(Date.now() / 1000) - 1800, cantidad: 22 },
              { timestamp: Math.floor(Date.now() / 1000) - 1200, cantidad: 28 },
              { timestamp: Math.floor(Date.now() / 1000) - 600, cantidad: 25 },
              { timestamp: Math.floor(Date.now() / 1000), cantidad: 35 }
            ]}
            title="Alertas por Hora"
            type="area"
            color="#EF4444"
          />
        </div>
      </section>
    </div>

    {/* Modal Instances */}
    <FormularioCamioneroV2 isOpen={formOpen} onClose={() => setFormOpen(false)} />
    
    <VerificarAlertaModalV2
      alerta={mockAlerta}
      isOpen={verificarOpen}
      onClose={() => setVerificarOpen(false)}
      onVerificar={async () => {
        console.log('Verificando alerta...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }}
    />
    
    <EditTransitoModalV2
      transito={mockTransito}
      isOpen={editTransitoOpen}
      onClose={() => setEditTransitoOpen(false)}
      onSuccess={() => console.log('Transito editado')}
    />
    </>
  )
}