import { useNavigation } from "@remix-run/react";
import React from "react";
import { FormOld } from "./components/form";
import { SlideOver } from "./components/slide-over";
import type { ConfigType } from "./types";
import { Form } from "~/components";

export const LibContext = React.createContext<{
  config: ConfigType;
}>({
  config: {} as ConfigType,
});

export const LibProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: ConfigType;
}) => {
  return (
    <LibContext.Provider value={{ config }}>{children}</LibContext.Provider>
  );
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
        <FormOld.SaveButton
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
