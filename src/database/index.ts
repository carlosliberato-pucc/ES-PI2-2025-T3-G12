// Desenvolvido por Carlos Liberato (Banco de Dados MySQL - Conexão)

// Importa o objeto de conexão com o MySQL que foi criado e configurado 
// no arquivo './connection.ts' (onde estão as credenciais e o connection.connect).
import db from './connection';

//Exporta a conexão importada sob o mesmo nome 'db'.
//Isso permite que outros arquivos importem a conexão de forma limpa, apontando para o diretório principal: 
//import { db } from '../index';
export { db };