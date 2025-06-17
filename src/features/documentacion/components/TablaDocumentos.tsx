import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Star, 
  Lock,
  MoreVertical,
  CheckSquare,
  Mail,
  Gavel,
  File,
  Archive,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Badge, EmptyState, LoadingState } from '../../../components/ui';
import { cn } from '../../../utils/utils';
import { formatFileSize, formatDate } from '../../../utils/formatters';
import type { Documento, TipoDocumento } from '../types';
import { TIPOS_DOCUMENTO } from '../types';

interface TablaDocumentosProps {
  documentos: Documento[];
  loading?: boolean;
  onDescargar: (doc: Documento) => void;
  onVisualizar: (doc: Documento) => void;
  onEliminar: (doc: Documento) => void;
  onArchivar: (doc: Documento) => void;
  onToggleDestacado: (doc: Documento) => void;
  canDelete?: boolean;
  canEdit?: boolean;
}

type OrdenColumna = 'fecha' | 'tipo' | 'descripcion' | 'empresa' | 'subidoPor';
type DireccionOrden = 'asc' | 'desc';

export const TablaDocumentos: React.FC<TablaDocumentosProps> = ({
  documentos,
  loading = false,
  onDescargar,
  onVisualizar,
  onEliminar,
  onArchivar,
  onToggleDestacado,
  canDelete = false,
  canEdit = false
}) => {
  const [ordenColumna, setOrdenColumna] = useState<OrdenColumna>('fecha');
  const [direccionOrden, setDireccionOrden] = useState<DireccionOrden>('desc');
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);

  const getIconoTipo = (tipo: TipoDocumento) => {
    switch (tipo) {
      case 'DUA':
        return <FileText className="h-5 w-5" />;
      case 'Autorizacion':
        return <CheckSquare className="h-5 w-5" />;
      case 'Comunicacion':
        return <Mail className="h-5 w-5" />;
      case 'Resolucion':
        return <Gavel className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getColorTipo = (tipo: TipoDocumento) => {
    return TIPOS_DOCUMENTO[tipo]?.color || 'gray';
  };

  const handleOrden = (columna: OrdenColumna) => {
    if (columna === ordenColumna) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenColumna(columna);
      setDireccionOrden('asc');
    }
  };

  const documentosOrdenados = [...documentos].sort((a, b) => {
    let valorA: any;
    let valorB: any;

    switch (ordenColumna) {
      case 'fecha':
        valorA = a.fechaDocumento.getTime();
        valorB = b.fechaDocumento.getTime();
        break;
      case 'tipo':
        valorA = a.tipo;
        valorB = b.tipo;
        break;
      case 'descripcion':
        valorA = a.descripcion.toLowerCase();
        valorB = b.descripcion.toLowerCase();
        break;
      case 'empresa':
        valorA = a.empresa?.toLowerCase() || '';
        valorB = b.empresa?.toLowerCase() || '';
        break;
      case 'subidoPor':
        valorA = a.subidoPor.nombre.toLowerCase();
        valorB = b.subidoPor.nombre.toLowerCase();
        break;
    }

    if (valorA < valorB) return direccionOrden === 'asc' ? -1 : 1;
    if (valorA > valorB) return direccionOrden === 'asc' ? 1 : -1;
    return 0;
  });

  const ColumnaOrden = ({ columna, children }: { columna: OrdenColumna; children: React.ReactNode }) => (
    <button
      onClick={() => handleOrden(columna)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      {children}
      {ordenColumna === columna && (
        direccionOrden === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      )}
    </button>
  );

  if (loading) {
    return <LoadingState variant="skeleton" rows={5} />;
  }

  if (documentos.length === 0) {
    return (
      <EmptyState
        icon="file"
        title="No se encontraron documentos"
        description="Intente ajustar los filtros o suba un nuevo documento"
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left">
              <ColumnaOrden columna="tipo">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo
                </span>
              </ColumnaOrden>
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnaOrden columna="descripcion">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Descripción / DUA
                </span>
              </ColumnaOrden>
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnaOrden columna="fecha">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fecha
                </span>
              </ColumnaOrden>
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnaOrden columna="empresa">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Empresa
                </span>
              </ColumnaOrden>
            </th>
            <th className="px-4 py-3 text-left">
              <ColumnaOrden columna="subidoPor">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Subido por
                </span>
              </ColumnaOrden>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tamaño
              </span>
            </th>
            <th className="px-4 py-3 text-center">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {documentosOrdenados.map((doc) => (
            <tr
              key={doc.id}
              className={cn(
                "hover:bg-gray-800/50 transition-colors",
                doc.estado === 'archivado' && "opacity-60"
              )}
            >
              {/* Tipo */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    `bg-${getColorTipo(doc.tipo)}-900/20`
                  )}>
                    <div className={cn(
                      `text-${getColorTipo(doc.tipo)}-500`
                    )}>
                      {getIconoTipo(doc.tipo)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={getColorTipo(doc.tipo) as any} className="text-xs w-fit">
                      {TIPOS_DOCUMENTO[doc.tipo].label}
                    </Badge>
                    {doc.estado === 'archivado' && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Archive className="h-3 w-3" />
                        Archivado
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Descripción */}
              <td className="px-4 py-4">
                <div className="space-y-1">
                  <p className="text-white font-medium line-clamp-2">
                    {doc.descripcion}
                  </p>
                  {doc.numeroDUA && (
                    <p className="text-sm text-gray-400">
                      DUA: {doc.numeroDUA}
                    </p>
                  )}
                  {doc.palabrasClave.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doc.palabrasClave.slice(0, 3).map((palabra, idx) => (
                        <span key={idx} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          {palabra}
                        </span>
                      ))}
                      {doc.palabrasClave.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{doc.palabrasClave.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {doc.destacado && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {doc.confidencial && (
                      <Lock className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </td>

              {/* Fecha */}
              <td className="px-4 py-4">
                <p className="text-gray-300">{formatDate(doc.fechaDocumento)}</p>
                <p className="text-xs text-gray-500">
                  Subido: {formatDate(doc.fechaSubida)}
                </p>
              </td>

              {/* Empresa */}
              <td className="px-4 py-4">
                <p className="text-gray-300">{doc.empresa || '-'}</p>
              </td>

              {/* Subido por */}
              <td className="px-4 py-4">
                <p className="text-gray-300">{doc.subidoPor.nombre}</p>
                <p className="text-xs text-gray-500">{doc.subidoPor.email}</p>
              </td>

              {/* Tamaño */}
              <td className="px-4 py-4">
                <p className="text-gray-400 text-sm">{formatFileSize(doc.tamanioArchivo)}</p>
              </td>

              {/* Acciones */}
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onVisualizar(doc)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Ver documento"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  <button
                    onClick={() => onDescargar(doc)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>

                  {(canEdit || canDelete) && (
                    <div className="relative">
                      <button
                        onClick={() => setMenuAbierto(menuAbierto === doc.id ? null : doc.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>

                      {menuAbierto === doc.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuAbierto(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
                            <div className="py-1">
                              {canEdit && (
                                <>
                                  <button
                                    onClick={() => {
                                      onToggleDestacado(doc);
                                      setMenuAbierto(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
                                  >
                                    <Star className={cn(
                                      "h-4 w-4",
                                      doc.destacado ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                                    )} />
                                    {doc.destacado ? 'Quitar destacado' : 'Marcar como destacado'}
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      onArchivar(doc);
                                      setMenuAbierto(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
                                  >
                                    <Archive className="h-4 w-4 text-gray-400" />
                                    {doc.estado === 'archivado' ? 'Desarchivar' : 'Archivar'}
                                  </button>
                                </>
                              )}
                              
                              {canDelete && (
                                <>
                                  <div className="border-t border-gray-700 my-1" />
                                  <button
                                    onClick={() => {
                                      onEliminar(doc);
                                      setMenuAbierto(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 text-left"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};