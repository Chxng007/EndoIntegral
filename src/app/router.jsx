import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Button, Loading } from "../components/ui";
import Inicio from "../pages/public/Inicio";
import ProtectedRoute from "./ProtectedRoute";
const Programa = lazy(() => import("../pages/public/Programa"));
const Endometriosis = lazy(() => import("../pages/public/Endometriosis"));
const Contacto = lazy(() => import("../pages/public/Contacto"));
const Ingresar = lazy(() => import("../pages/public/Ingresar"));
const Privacidad = lazy(() => import("../pages/public/Privacidad"));
const MemberLayout = lazy(() => import("../components/layout/MemberLayout"));
const MemberHome = lazy(() => import("../pages/member/MemberHome"));
const Sintomas = lazy(() => import("../pages/member/Sintomas"));
const Diario = lazy(() => import("../pages/member/Diario"));
const Recursos = lazy(() => import("../pages/member/Recursos"));
const Yoga = lazy(() =>
  import("../pages/member/Recursos").then((m) => ({ default: m.Yoga })),
);
const Mindfulness = lazy(() =>
  import("../pages/member/Recursos").then((m) => ({ default: m.Mindfulness })),
);
const Cartilla = lazy(() =>
  import("../pages/member/Recursos").then((m) => ({ default: m.Cartilla })),
);
const EndoVoces = lazy(() => import("../pages/member/EndoVoces"));
const Acompanamiento = lazy(() => import("../pages/member/Acompanamiento"));
const Foro = lazy(() => import("../pages/member/Foro"));
const Cuenta = lazy(() => import("../pages/member/Cuenta"));
const AdminLayout = lazy(() => import("../pages/admin/Admin"));
const admin = (name) =>
  lazy(() =>
    import("../pages/admin/Admin").then((m) => ({ default: m[name] })),
  );
const AdminHome = admin("AdminHome"),
  AdminMembers = admin("AdminMembers"),
  AdminInbox = admin("AdminInbox"),
  AdminContent = admin("AdminContent"),
  AdminForum = admin("AdminForum");
const titles = {
  "/": "Cuerpo, mente y bienestar",
  "/programa": "Nuestro programa",
  "/endometriosis": "Hablemos de endometriosis",
  "/contacto": "Contáctanos",
  "/ingresar": "Ingresa a tu espacio",
  "/privacidad": "Tratamiento de datos",
};
export default function Router() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = `EndoIntegral · ${titles[pathname] || "Tu espacio de bienestar"}`;
    if (hash) {
      let tries = 0;
      const timer = setInterval(() => {
        const el = document.getElementById(hash.slice(1));
        if (el || ++tries > 20) {
          clearInterval(timer);
          el?.scrollIntoView({ behavior: "instant" });
        }
      }, 100);
      return () => clearInterval(timer);
    } else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="programa" element={<Programa />} />
          <Route path="endometriosis" element={<Endometriosis />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="ingresar" element={<Ingresar />} />
          <Route path="privacidad" element={<Privacidad />} />
          <Route element={<ProtectedRoute />}>
            <Route path="app" element={<MemberLayout />}>
              <Route index element={<MemberHome />} />
              <Route path="sintomas" element={<Sintomas />} />
              <Route path="diario" element={<Diario />} />
              <Route path="recursos" element={<Recursos />} />
              <Route path="recursos/yoga" element={<Yoga />} />
              <Route path="recursos/mindfulness" element={<Mindfulness />} />
              <Route path="cartilla" element={<Cartilla />} />
              <Route path="endo-voces" element={<EndoVoces />} />
              <Route path="acompanamiento" element={<Acompanamiento />} />
              <Route path="foro" element={<Foro />} />
              <Route path="cuenta" element={<Cuenta />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute admin />}>
            <Route path="admin" element={<MemberLayout />}>
              <Route element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="miembras" element={<AdminMembers />} />
              <Route path="mensajes" element={<AdminInbox />} />
              <Route path="solicitudes" element={<AdminInbox appointments />} />
              <Route
                path="podcasts"
                element={<AdminContent kind="podcasts" />}
              />
              <Route
                path="profesionales"
                element={<AdminContent kind="profesionales" />}
              />
              <Route
                path="recursos"
                element={<AdminContent kind="recursos" />}
              />
              <Route path="videos" element={<AdminContent kind="videos" />} />
              <Route path="foro" element={<AdminForum />} />
              </Route>
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <section className="container not-found">
                <p className="eyebrow">UN PEQUEÑO DESVÍO</p>
                <h1>
                  Volvamos a <em>encontrarnos.</em>
                </h1>
                <p>
                  Esta página no está disponible. Tu camino puede continuar
                  desde el inicio.
                </p>
                <Button to="/" arrow>
                  Volver al inicio
                </Button>
              </section>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
