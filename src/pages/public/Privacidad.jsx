import { PageHeader } from "../../components/layout/Layout";
import { Notice } from "../../components/ui";
export default function Privacidad() {
  return (
    <>
      <PageHeader
        eyebrow="TU INFORMACIÓN, CON CUIDADO"
        title="Tratamiento de"
        accent="datos personales"
        description="Transparencia sobre cómo se prepara el cuidado de tu información."
      />
      <section className="container section legal-content prose">
        <Notice>
          Documento informativo en revisión. El equipo debe completar la
          identificación del responsable, los canales para ejercer tus derechos
          y aprobar la política antes de habilitar la recepción de datos.
        </Notice>
        <h2>Para qué se usarán los datos</h2>
        <p>
          Los datos de contacto se usarán para responder consultas y coordinar
          el acceso al programa. La información de salud que decidas registrar
          en el área privada se utilizará para las herramientas de seguimiento y
          acompañamiento que solicites.
        </p>
        <h2>Información sensible y consentimiento</h2>
        <p>
          Los registros de síntomas y las entradas del diario pueden contener
          datos sensibles. El acceso a estas herramientas requiere autorización
          explícita. La plataforma no debe usarse para almacenar información
          clínica hasta que la política haya sido revisada y el servicio
          activado.
        </p>
        <h2>Acceso a tu información</h2>
        <p>
          Los registros personales de síntomas y diario se diseñan para ser
          visibles únicamente para su titular. Las publicaciones del foro se
          comparten con la comunidad de acuerdo con la opción de publicación
          elegida y las normas de moderación.
        </p>
        <h2>Tus derechos</h2>
        <p>
          Podrás consultar, actualizar, corregir y solicitar la supresión de tus
          datos o revocar la autorización en los casos aplicables. El área de
          cuenta incluye herramientas para exportar tus registros y solicitar o
          realizar su eliminación.
        </p>
        <h2>Videos y enlaces externos</h2>
        <p>
          Los videos de YouTube se cargan al pulsar reproducir. Al hacerlo te
          conectas con un servicio externo sujeto a sus propias políticas. No se
          han incorporado herramientas publicitarias ni analítica de
          seguimiento.
        </p>
        <h2>Responsable y consultas</h2>
        <p>
          EndoIntegral debe confirmar la razón social, identificación,
          domicilio, correo de privacidad, plazos de atención y condiciones de
          conservación antes de publicar la versión definitiva.
        </p>
        <p>Versión de preparación: 1.0 · Septiembre de 2026.</p>
      </section>
    </>
  );
}
