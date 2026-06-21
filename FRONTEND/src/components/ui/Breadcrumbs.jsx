import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const routeLabels = {
  product: "Products",
  wishlist: "Wishlist",
  orders: "Orders",
  create: "Create Product",
  login: "Login",
  signup: "Signup",
};

const Breadcrumbs = ({ currentPage }) => {
  const location = useLocation();

  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb mb={6} fontSize="sm" aria-label="Breadcrumb navigation">
      <BreadcrumbItem>
        <BreadcrumbLink as={RouterLink} to="/">
          Home
        </BreadcrumbLink>
      </BreadcrumbItem>

      {paths.map((segment, index) => {
        const isLast = index === paths.length - 1;

        let label =
          routeLabels[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);

        if (isLast && currentPage) {
          label = currentPage;
        }

        return (
          <BreadcrumbItem key={segment + index} isCurrentPage={isLast}>
            {isLast ? (
              <BreadcrumbLink>{label}</BreadcrumbLink>
            ) : (
              <BreadcrumbLink
                as={RouterLink}
                to={`/${paths.slice(0, index + 1).join("/")}`}
              >
                {label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
