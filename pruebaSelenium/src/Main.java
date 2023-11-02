import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import java.io.BufferedWriter;
import java.io.FileWriter;

public class Main
{
    public static void main(String[] args)
    {
        String mensajeExcepcion = "No ocurrieron excepciones";
        String ruta = "driver\\registroDePrograma.txt";

        System.setProperty("webdriver.chrome.driver", "driver\\chromedriver.exe"); //va a usar el driver de chrome

        ChromeOptions opciones = new ChromeOptions(); //configuro opciones de chrome
        opciones.addArguments("--start-maximized"); //lo abre en pantalla completa

        WebDriver driver = new ChromeDriver(opciones); //inicializo el controlador de chrome (driver)

        try
        {
            driver.get("https://www.consultoriaglobal.com.ar/cgweb/"); //abro la pagina
            System.out.println("Página de Consultoría Global abierta.");
            Esperar(1);

            //Boton contacto
            WebElement contactoLink = DetectarElemento(driver, "menu-item-1364", true, false, false);
            contactoLink.click();
            System.out.println("Página de contacto abierta");
            Esperar(1);

            //Nombre
            WebElement nombreInput = DetectarElemento(driver, "your-name", false, true, false);
            nombreInput.sendKeys("Francisco Martinez Balian");
            System.out.println("Se ingreso el nombre");
            Esperar(1);

            //Email
            WebElement emailInput = DetectarElemento(driver, "your-email", false, true, false);
            emailInput.sendKeys("correo_invalido");
            System.out.println("Se ingreso un correo invalido");
            Esperar(1);

            //Asunto
            WebElement asuntoInput = DetectarElemento(driver, "your-subject", false, true, false);
            asuntoInput.sendKeys("Prueba de entrevista");
            System.out.println("Se ingreso un asunto");
            Esperar(1);

            //Mensaje
            WebElement mensajeInput = DetectarElemento(driver, "your-message", false, true, false);
            mensajeInput.sendKeys("Mensaje de prueba");
            System.out.println("Se ingreso un mensaje de prueba");
            Esperar(1);

            //Captcha "captcha-636"
            WebElement captchaInput = DetectarElemento(driver, "captcha-636", false, true, false);
            captchaInput.sendKeys("1234");
            System.out.println("Se ingreso un texto referido al captcha");
            Esperar(1);

            //Boton de enviar
            WebElement enviar = DetectarElemento(driver, "input[value='Enviar']", false, false, true);
            enviar.click();
            System.out.println("Botón 'Enviar' presionado");
            Esperar(2);

            //Mensaje error
            WebElement error = DetectarElemento(driver, "[role='alert']", false, false, true);
            System.out.println(error.getText());
            Esperar(1);
        }
        catch (Exception ex)
        {
            mensajeExcepcion = "Error: " + ex.getMessage();
        }
        finally
        {
            driver.quit();
            System.out.println("El programa ha finalizado");

            try (BufferedWriter escritor = new BufferedWriter(new FileWriter(ruta, true)))
            {
                escritor.write(mensajeExcepcion + "\n");
            }
            catch (Exception ex)
            {
                System.out.println("Error al escribir en el archivo de registro: " + ex.getMessage());
            }
        }
    }

    /**
     * Genera una espera de tantos segundos
     * @param segundos Cantidad de segundos que se quiere parar el programa
     */
    public static void Esperar(int segundos)
    {
        segundos = segundos * 1000;
        try
        {
            Thread.sleep(segundos);
        }
        catch (Exception ex)
        {
            System.out.println("Error: ");
            ex.printStackTrace();
        }
    }

    /**
     * Detecta un elemento de la pagina segun un identificador
     * @param driver Es el driver que se utiliza
     * @param texto Valor con el cual se identifica
     * @param id Si esta en true, se identifica el elemento por el id
     * @param name Si esta en true, se identifica el elemento por el nombre
     * @param css Si esta en true, se identifica el elemento por el cssSelector
     * @return Retorna un elemento de tipo WebElement
     */
    public static WebElement DetectarElemento(WebDriver driver, String texto, boolean id, boolean name, boolean css)
    {
        WebElement elemento = null;

        if(id)
        {
            elemento = driver.findElement(By.id(texto));
        }
        else if (name)
        {
            elemento = driver.findElement(By.name(texto));
        }
        else if (css)
        {
            elemento = driver.findElement(By.cssSelector(texto));
        }

        return elemento;
    }
}