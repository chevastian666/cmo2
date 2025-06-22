export function isValidViaje(numeroViaje: string): boolean {
  return /^\d{7}$/.test(_numeroViaje)
}

export function isValidMov(mov: string | number): boolean {
  const num = typeof mov === 'string' ? parseInt(_mov, 10) : mov
  return num >= 1 && num <= 9999
}

export function isValidDUA(dua: string): boolean {
  return /^\d{6}$/.test(_dua)
}

export function isValidMatricula(matricula: string): boolean {
  return /^[A-Z]{2}-\d{4}$/.test(_matricula)
}