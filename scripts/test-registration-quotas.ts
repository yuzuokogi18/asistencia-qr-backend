async function testRegistrationQuotas() {
  console.log('=== INICIANDO PRUEBA DE FLUJO DE REGISTRO Y CUPOS (2 DIRECTORAS + 2 OPERADORES) ===\n');

  const API_URL = 'http://localhost:3001/api/auth';

  // Helper para consultar cupos
  async function getCupos() {
    const res = await fetch(`${API_URL}/cupos`);
    const json = await res.json();
    return json.data;
  }

  // Helper para registrar
  async function register(nombre: string, usuario: string, password: string, rol: 'admin' | 'operador') {
    const res = await fetch(`${API_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, usuario, password, rol }),
    });
    const json = await res.json();
    return { status: res.status, ...json };
  }

  // 1. Estado inicial
  const c0 = await getCupos();
  console.log('Estado inicial de cupos:', c0);

  // 2. Registro Directora 1
  console.log('\n--- Registrando Directora 1 ---');
  const r1 = await register('Directora María Pérez', 'directora1', 'Directora123*', 'admin');
  console.log('Directora 1 Status:', r1.status, r1.message);

  // 3. Registro Directora 2
  console.log('\n--- Registrando Directora 2 ---');
  const r2 = await register('Directora Rosa García', 'directora2', 'Directora123*', 'admin');
  console.log('Directora 2 Status:', r2.status, r2.message);

  // 4. Intentar registrar Directora 3 (debe fallar)
  console.log('\n--- Intentando registrar Directora 3 (Exceder cupo de 2 admin) ---');
  const r3 = await register('Directora Carmen Ortiz', 'directora3', 'Directora123*', 'admin');
  console.log('Directora 3 Status (esperado 400):', r3.status, 'Mensaje:', r3.message);

  // 5. Consultar cupos intermedios
  const c1 = await getCupos();
  console.log('Cupos tras 2 directoras:', { admin: c1.admin, adminDisponible: c1.adminDisponible, operadorDisponible: c1.operadorDisponible });

  // 6. Registro Operador 1
  console.log('\n--- Registrando Operador 1 ---');
  const o1 = await register('Prefecto Pedro Gómez', 'operador1', 'Operador123*', 'operador');
  console.log('Operador 1 Status:', o1.status, o1.message);

  // 7. Registro Operador 2
  console.log('\n--- Registrando Operador 2 ---');
  const o2 = await register('Prefecta Ana Morales', 'operador2', 'Operador123*', 'operador');
  console.log('Operador 2 Status:', o2.status, o2.message);

  // 8. Intentar registrar Operador 3 (debe fallar)
  console.log('\n--- Intentando registrar Operador 3 (Cupo total lleno 4/4) ---');
  const o3 = await register('Prefecto Juan López', 'operador3', 'Operador123*', 'operador');
  console.log('Operador 3 Status (esperado 400):', o3.status, 'Mensaje:', o3.message);

  // 9. Estado final de cupos
  const c2 = await getCupos();
  console.log('\nEstado final de cupos (Cupo agotado):', c2);

  console.log('\n=== PRUEBA DE CUPOS COMPLETADA CON ÉXITO ===');
}

testRegistrationQuotas().catch(console.error);
