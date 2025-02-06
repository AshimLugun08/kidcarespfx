// KidDetailList.tsx
import * as React from "react";
import { useEffect } from "react";
import { IKidDetailListProps } from "./IKidDetailListProps";
import DataTable from "./KidDataComponent";
import styles from './KidDetailList.module.scss';
import TodaysAppointmentList from "./TodaysAppointmentList";
import { KidProvider } from "./context/kidcontext"; // Import the provider

const KidDetailList: React.FC<IKidDetailListProps> = () => {
  useEffect(() => {
    const setupLayout = () => {
      // Target specific SharePoint canvas elements
      const canvasZone = document.querySelector(".CanvasZone");
      const canvasSection = document.querySelector(".CanvasSection");
      const canvasZoneContainer = document.querySelector(".CanvasZoneContainer");
      
      if (canvasZone) {
        canvasZone.setAttribute('style', 'padding: 0 !important; margin: 0 !important; width: 100% !important;');
      }
      
      if (canvasSection) {
        canvasSection.setAttribute('style', 'padding: 0 !important; margin: 0 !important; width: 100% !important; left: 0 !important;');
      }

      if (canvasZoneContainer) {
        canvasZoneContainer.setAttribute('style', 'max-width: none !important; padding: 0 !important; margin: 0 !important;');
      }

      // Remove data-offset values that might be causing the shift
      const spFreCanvas = document.querySelectorAll("[data-sp-fre-id]");
      spFreCanvas.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.left = '0';
          element.style.margin = '0';
          element.removeAttribute('data-offset-left');
          element.removeAttribute('data-offset-top');
        }
      });
    };

    setupLayout();
    window.addEventListener('resize', setupLayout);
    return () => window.removeEventListener('resize', setupLayout);
  }, []);

  return (
    <KidProvider>
      <div className={`${styles.kidDetailContainer} TableMain`}>
        <DataTable />
        <TodaysAppointmentList/>
      </div>
    </KidProvider>
  );
};

export default KidDetailList;
