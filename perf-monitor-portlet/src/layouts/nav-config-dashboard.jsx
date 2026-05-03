// import { Label } from 'src/components/label';
// import { SvgColor } from "src/components/svg-color";
import { SvgColor } from "../components/svg-color";

// ----------------------------------------------------------------------

// 좌측 메뉴 설정 영역

// const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;
const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

// export type NavItem = {
//   title: string;
//   path: string;
//   icon: React.ReactNode;
//   info?: React.ReactNode;
// };

export const navData = [
  {
    title: "Monitoring",
    path: "/",
    icon: icon("ic-analytics"),
  },
  {
    title: "User",
    path: "/user",
    icon: icon("ic-user"),
  },
  {
    title: "Product",
    path: "/products",
    icon: icon("ic-cart"),
    info:
      // <Label color="error" variant="inverted">
      +3,
    // </Label>
  },
  {
    title: "Blog",
    path: "/blog",
    icon: icon("ic-blog"),
  },
  {
    title: "Sign in",
    path: "/sign-in",
    icon: icon("ic-lock"),
  },
  {
    title: "Not found",
    path: "/404",
    icon: icon("ic-disabled"),
  },
  {
    title: "Incident Analytics",
    path: "/incidentAnalytics",
    icon: icon("ic-lock"),
  },
  {
    title: "Error Logs",
    path: "/errorLog",
    icon: icon("ic-lock"),
  },
  {
    title: "Mail",
    path: "/mail",
    icon: icon("ic-lock"),
  },
  {
    title: "TestPage",
    path: "/testPage",
    icon: icon("ic-lock"),
  },
];
