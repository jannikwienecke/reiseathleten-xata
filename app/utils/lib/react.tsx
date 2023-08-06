import { useNavigation } from "@remix-run/react";
import React from "react";
import { Form } from "~/components";
import { SlideOver } from "./components/slide-over";
import { useAdminPage } from "./hooks";
import { ConfigType } from "./types";

export const useLib = () => {
  const { admin } = React.useContext(LibContext);

  return admin;
};

export const LibContext = React.createContext<{
  admin: ReturnType<typeof useAdminPage>;
}>({
  admin: {} as ReturnType<typeof useAdminPage>,
});

export const LibProvider = ({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin: ReturnType<typeof useAdminPage>;
}) => {
  return (
    <LibContext.Provider value={{ admin }}>{children}</LibContext.Provider>
  );
};

export const LibConfigContext = React.createContext<{
  config: ConfigType;
}>({
  config: {} as ConfigType,
});

export const LibConfigProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: ConfigType;
}) => {
  return (
    <LibConfigContext.Provider value={{ config }}>
      {children}
    </LibConfigContext.Provider>
  );
};

export const useLibConfig = () => {
  const { config } = React.useContext(LibConfigContext);

  if (!config) {
    throw new Error("LibConfigProvider is missing");
  }

  return config;
};

export const LibFormOld = ({
  title,
  children,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  onCancel?: () => void;
}) => {
  const { state } = useNavigation();

  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return (
    <Form
      onCancel={onCancel}
      // isDone={stateRef.current === "loading" && state === "submitting"}
      title={title}
      method="POST"
      SaveButton={
        <Form.SaveButton
          label={state === "submitting" ? "Saving..." : "Save"}
          isLoading={state === "submitting"}
        />
      }
    >
      {children}
    </Form>
  );
};

export const LibSliderOver = ({
  children,
  isOpen,
  onCancel,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onCancel: () => void;
}) => {
  return (
    <SlideOver isOpen={isOpen} onClose={onCancel}>
      {children}
    </SlideOver>
  );
};
