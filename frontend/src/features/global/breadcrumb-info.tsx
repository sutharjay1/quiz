import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BsFolder2Open } from "react-icons/bs";
import { BiAt } from "react-icons/bi";
import { SiAnalogue } from "react-icons/si";
import { useQuiz } from "@/hooks/use-quiz";
import { useLocation } from "react-router";

const BreadcrumbInfo = () => {
  const { quiz } = useQuiz();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">
            <BreadcrumbPage className="flex items-center gap-2">
              <BsFolder2Open
                size={16}
                className="font-semibold"
                strokeWidth={1.08}
              />
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-2">
            <BiAt size={16} className="font-semibold" strokeWidth={1.08} />
            {quiz?.name}
          </BreadcrumbPage>
        </BreadcrumbItem>

        {pathname?.includes("/analytics") && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <SiAnalogue
                  size={16}
                  className="font-semibold"
                  strokeWidth={1.08}
                />
                Analytics
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbInfo;
