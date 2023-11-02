import './App.css';
import React, { useState, useEffect } from 'react'; //ganchos para administrar el estado y efectos de los componentes funcionales
import { Container, TextField, Button, List, ListItem, ListItemText, Checkbox, Typography} from '@mui/material'; //Material-UI (disenio)
import { openDB } from 'idb'; //base de datos

function App() //es como la clase Main
{
	//tarea es el nombre de la variable
	//useState declara e inicializa a tarea y aparte declara la funcion setTarea que actualiza el valor de tarea cuando se llame
	const [tarea, setTarea] = useState('');
	
	//tareas es el array en el cual se va a guardar las tareas
	//setTareas actualiza el valor de tareas
	const [tareas, setTareas] = useState([]);

	//useState declara e inicializa a tareasPendientes y aparte declara la funcion setCantidadTareasPendientes
	const [tareasPendientes, setTareasPendientes] = useState(0);

	useEffect(() => //se inicializa este componente y adentro se manejan distintos efectos
	{
		//async indica que la funcion puede contener operaciones que requieran tiempo, sin detener la ejecucion del programa
		async function InicializarBaseDeDatos()
		{
			//await espera a que primero termine el proceso para despues continuar
			const db = await openDB('todoAppBD', 1, //crea o abre la base de datos, 1 es la version
			{
				upgrade(db) //actualiza la base de datos
				{
					//crea una tienda de objetos (es donde se almacenan los datos)
					//tareasBD es el nombre de esta tienda
					//keyPath es la clave primaria y es autoincremental
					//si existe, no sobreescribre
					const tiendaObjetos = db.createObjectStore('tareasBD', { keyPath: 'id', autoIncrement: true });

					//se crea un indice llamado completed (primer param)
					//se crea la propiedad de los objetos de la bd llamada completed, la cual va a ir variando en true o false
					//despues busco mediante el indice si las tareas estan completas o no
					tiendaObjetos.createIndex('completed', 'completed');
				},
			});

			const transaccion = db.transaction('tareasBD', 'readonly'); //crea un objeto de transaccion de datos de solo lectura
			const tiendaObjetos = transaccion.objectStore('tareasBD'); //inicializo la tiendaObjetos con las tareas que ya habia
			const tareas = await tiendaObjetos.getAll(); //cargo todas las tareas que hay la tiendaObjetos

			setTareas(tareas); //actualizo la lista de tareas

			//de las tareas, traigo las que la propiedad completed esta en false
			const cantTareasIncompletas = tareas.filter(task => !task.completed).length; //filtro por tareas incompletas
			setTareasPendientes(cantTareasIncompletas); //actualizo la lista de tareas pendientes
		}

		InicializarBaseDeDatos(); //una sola vez se llama cuando se inicia la app
	}, []);

	//cuando se interactua con el campo de texto, se llama a esta funcion
	const manejarTarea = (event) =>
	{
		setTarea(event.target.value); //establezco la tarea con ese valor que se escribio
	};

	const manejarAgregadoDeTareas = async () => 
	{
		if (tarea.trim() !== '')
		{
			const db = await openDB('todoAppBD', 1);
			const transaccion = db.transaction('tareasBD', 'readwrite'); //se crea una transaccion de datos en modo escritura
			const tiendaObjetos = transaccion.objectStore('tareasBD'); //se asigna a tiendaObjetos las tareas que hay
			const nuevaTarea = { text: tarea, completed: false }; //se crea una nueva tarea incompleta y con el texto de 'tarea' 
			await tiendaObjetos.add(nuevaTarea); //se agrega a la tiendaOb
			
			// Actualiza las tareas y las tareas pendientes después de la operación
			const tareasActualizadas = await tiendaObjetos.getAll(); //me traigo todas las tareas
			setTareas(tareasActualizadas); //actualizo la lista de tareas

			const cantTareasIncompletas = tareasActualizadas.filter(task => !task.completed).length;
			setTareasPendientes(cantTareasIncompletas); //actualizo la lista de tareas que no estan completas

			setTarea(''); //vuelvo a setear el campo de tareas en vacio
		}
	};

	const manejarCambioEnTareas = async (id) => 
	{
		const db = await openDB('todoAppBD', 1);
		const transaccion = db.transaction('tareasBD', 'readwrite');
		const tiendaObjetos = transaccion.objectStore('tareasBD');
		const tareaParaActualizar = await tiendaObjetos.get(id);

		tareaParaActualizar.completed = !tareaParaActualizar.completed; //cambio si estaba completada o no
		await tiendaObjetos.put(tareaParaActualizar); //guardo esa misma tarea modificada en la base de datos

		const tareasActualizadas = await tiendaObjetos.getAll();
		setTareas(tareasActualizadas);
		const cantTareasIncompletas = tareasActualizadas.filter(task => !task.completed).length;
		setTareasPendientes(cantTareasIncompletas);
	};

	const eliminarTareasCompletas = async () => 
	{
		const db = await openDB('todoAppBD', 1);
		const transaccion = db.transaction('tareasBD', 'readwrite');
		const tiendaObjetos = transaccion.objectStore('tareasBD');

		const tareasCompletadas = (await tiendaObjetos.getAll()).filter(task => task.completed); //ahora filtro por tareas completadas

		for (const tarea of tareasCompletadas)
		{
			await tiendaObjetos.delete(tarea.id); //elimino la tarea
		}

		const tareasActualizadas = await tiendaObjetos.getAll();
		setTareas(tareasActualizadas);

		const cantTareasIncompletas = tareasActualizadas.filter(task => !task.completed).length;
		setTareasPendientes(cantTareasIncompletas);
	};

	//define la estructura del componente que se va a ver en la interfaz
	return (
		<div style = {{ marginTop: '20px' }}>
			<Container> 
				<Typography variant = "h4" gutterBottom> {/* gutterBottom le da un margen inferior para tener un poco mas de espacio */}
					To-Do App
				</Typography>
				<div>
					<div style = {{ marginBottom: '10px' }}>
						{/*TextField es el textbox y el value es el valor de la tarea el cual va a ir cambiando cuando se llame al onChange*/}
						<TextField label = "Nueva tarea" fullWidth value = {tarea} onChange = {manejarTarea}/>
					</div>
					<div style = {{ marginBottom: '10px' }}>
						<Button color = "primary" onClick = {manejarAgregadoDeTareas}>
							Agregar
						</Button>
						<Button color = "error" onClick = {eliminarTareasCompletas}>
							Eliminar tareas completas
						</Button>
					</div>
				</div>
				<List>
					{tareas.map((task) => ( //crea una lista de elementos con el contenido de tareas
						<ListItem key = {task.id} button onClick={() => manejarCambioEnTareas(task.id)} //de la tarea, selecciono el id
							style = {{ textDecoration: task.completed ? 'line-through' : 'none' }}> {/*si la tarea esta completa, se tacha*/}
								<Checkbox checked = {task.completed} color = "info"/>
								<ListItemText primary = {task.text}/> {/*muestra el texto de esa tarea en el item*/}
						</ListItem>
					))}
				</List>
				<Typography variant = "subtitle1">
					Tareas pendientes: {tareasPendientes}
				</Typography>
			</Container>
		</div>
	);
}
export default App; //permite el uso de App en otros archivos, o sea, que se haga un import