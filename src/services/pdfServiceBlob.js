import { PDFDocument, rgb, StandardFonts } from "pdf-lib";



// Helper function to safely get nested properties with error handling

const getNestedValue = (obj, path, defaultValue = "") => {

  if (!obj) return defaultValue;

  try {

    return path.split(".").reduce((o, p) => {

      if (o === null || o === undefined) return defaultValue;

      const value = o[p];

      return value !== undefined ? value : defaultValue;

    }, obj);

  } catch (error) {

    console.warn(`Error accessing path ${path}:`, error);

    return defaultValue;

  }

};



// Format value for display

const formatValue = (value, options = {}) => {

  // Handle undefined, null, or empty string

  if (value === undefined || value === null || value === "") {

    return "Not provided";

  }



  // Handle boolean values

  if (typeof value === "boolean") {

    return value ? "Yes" : "No";

  }



  // Handle arrays

  if (Array.isArray(value)) {

    if (value.length === 0) return "None";



    // Special handling for children array

    if (

      options.path === "willInstructions.children" ||

      (value[0] && typeof value[0] === "object" && "fullName" in value[0])

    ) {

      return value

        .map((child, index) => {

          if (!child || typeof child !== "object") {

            return `Child ${index + 1}: Invalid data`;

          }

          const details = [

            `Child ${index + 1}:`,

            `Full Name: ${child.fullName || "Not provided"}`,

            `Title: ${child.title || "Not provided"}`,

            `Date of Birth: ${child.dob || "Not provided"}`,

            `Address: ${child.address || "Not provided"}`,

            `Relationship to Client 1: ${child.relationshipClient1 || "Not specified"

            }`,

            `Relationship to Client 2: ${child.relationshipClient2 || "Not specified"

            }`,

          ];



          // Only add separator between children, not after the last one

          if (index < value.length - 1) {

            details.push(""); // Single empty line between children

          } else {

            // For the last child, remove any trailing whitespace that might add extra space

            return details.join("\n").trim();

          }



          return details.join("\n");

        })

        .filter(Boolean) // Remove any empty strings that might cause extra newlines

        .join("\n");

    }



    // Handle simple arrays

    return value

      .map((item) =>

        typeof item === "object" ? JSON.stringify(item) : String(item),

      )

      .join(", ");

  }



  // Handle objects

  if (typeof value === "object" && value !== null) {

    if (Array.isArray(value)) {

      // This should have been handled above, but just in case

      return "Array data";

    }

    if (!value || Object.keys(value).length === 0) return "Not provided";

    return Object.entries(value)

      .map(([key, val]) => {

        // Handle null/undefined values in objects

        if (val === null || val === undefined) {

          return `${key}: Not provided`;

        }

        return `${key}: ${formatValue(val)}`;

      })

      .join("\n");

  }



  // Handle other types (string, number, etc.)

  return String(value).trim();

};



// Helper function to safely get values with fallbacks

const getSafeValue = (obj, path, defaultValue = "Not provided") => {

  if (!obj) return defaultValue;

  const value = path.split(".").reduce((o, p) => o?.[p], obj);

  return value !== undefined && value !== null && value !== ""

    ? value

    : defaultValue;

};



// Function to deep merge objects

const deepMerge = (target, source) => {

  const output = { ...target };

  if (isObject(target) && isObject(source)) {

    Object.keys(source).forEach((key) => {

      if (isObject(source[key])) {

        if (!(key in target)) {

          Object.assign(output, { [key]: source[key] });

        } else {

          output[key] = deepMerge(target[key], source[key]);

        }

      } else {

        Object.assign(output, { [key]: source[key] });

      }

    });

  }

  return output;

};



const isObject = (item) => {

  return item && typeof item === "object" && !Array.isArray(item);

};



// Helper function to check if a value is empty

const isEmpty = (value) => {

  if (value === null || value === undefined) return true;

  if (typeof value === "string") return value.trim() === "";

  if (Array.isArray(value)) return value.length === 0;

  if (typeof value === "object") return Object.keys(value).length === 0;

  return false;

};



// Helper function to clean and validate form data

const cleanFormData = (formData) => {

  if (!formData || typeof formData !== "object") {

    throw new Error("Invalid form data provided");

  }



  // Ensure all nested objects exist to prevent null reference errors

  return {

    clientDetails: formData.clientDetails || {},

    willInstructions: formData.willInstructions || {},

    familyProtection: formData.familyProtection || {},

    lpaInstructions: formData.lpaInstructions || {},

    idInformation: formData.idInformation || {},

    signatures: formData.signatures || {},

  };

};



export const generatePDFBlob = async (formData = {}) => {

  console.log("=== PDF BLOB GENERATION STARTED ===");

  console.log("FormData received:", formData);



  // Validate input

  if (!formData || typeof formData !== "object") {

    throw new Error("Invalid form data provided");

  }



  // Ensure all nested objects exist to prevent null reference errors

  const safeFormData = {

    clientDetails: formData.clientDetails || {},

    willInstructions: formData.willInstructions || {},

    familyProtection: formData.familyProtection || {},

    lpaInstructions: formData.lpaInstructions || {},

    idInformation: formData.idInformation || {},

    signatures: formData.signatures || {},

  };



  console.log("=== SAFE FORM DATA CREATED ===");

  console.log("Client Details exists:", !!safeFormData.clientDetails);

  console.log("Will Instructions exists:", !!safeFormData.willInstructions);



  // Process client details with safe access

  const clientDetails = {

    // Core client 1 info

    clientReference: getSafeValue(

      safeFormData,

      "clientDetails.clientReference",

    ),

    adviserName: getSafeValue(safeFormData, "clientDetails.adviserName"),

    caseNotes: getSafeValue(safeFormData, "clientDetails.caseNotes", ""),

    previousWill: getSafeValue(

      safeFormData,

      "clientDetails.previousWill",

      false,

    ),

    title: getSafeValue(safeFormData, "clientDetails.title"),

    firstName: getSafeValue(safeFormData, "clientDetails.firstName"),

    lastName: getSafeValue(safeFormData, "clientDetails.lastName"),

    fullName:

      getSafeValue(safeFormData, "clientDetails.fullName") ||

      `${getSafeValue(safeFormData, "clientDetails.firstName")} ${getSafeValue(

        safeFormData,

        "clientDetails.lastName",

      )}`.trim() ||

      "Not provided",

    dob: getSafeValue(safeFormData, "clientDetails.dob"),

    email: getSafeValue(safeFormData, "clientDetails.email"),

    telephone: getSafeValue(safeFormData, "clientDetails.telephone"),

    mobile: getSafeValue(safeFormData, "clientDetails.mobile"),

    phone:

      getSafeValue(safeFormData, "clientDetails.phone") ||

      getSafeValue(safeFormData, "clientDetails.mobile") ||

      getSafeValue(safeFormData, "clientDetails.telephone"),

    maritalStatus: getSafeValue(safeFormData, "clientDetails.maritalStatus"),

    address: getSafeValue(safeFormData, "clientDetails.address"),

    address2: getSafeValue(safeFormData, "clientDetails.address2", ""),

    nationalInsurance:

      getSafeValue(safeFormData, "clientDetails.nationalInsurance") ||

      getSafeValue(safeFormData, "clientDetails.clientReference"),

    // Client 2 info (if present)

    title2: getSafeValue(safeFormData, "clientDetails.title2"),

    firstName2: getSafeValue(safeFormData, "clientDetails.firstName2"),

    lastName2: getSafeValue(safeFormData, "clientDetails.lastName2"),

    dob2: getSafeValue(safeFormData, "clientDetails.dob2"),

    email2: getSafeValue(safeFormData, "clientDetails.email2"),

    telephone2: getSafeValue(safeFormData, "clientDetails.telephone2"),

    mobile2: getSafeValue(safeFormData, "clientDetails.mobile2"),

    maritalStatus2: getSafeValue(safeFormData, "clientDetails.maritalStatus2"),

    addressSecond: getSafeValue(safeFormData, "clientDetails.address2", ""),

    // Meeting attendees information

    meetingAttendees: {

      isAnyoneElsePresent: getSafeValue(

        safeFormData,

        "clientDetails.meetingAttendees.isAnyoneElsePresent",

        false,

      ),

      name: getSafeValue(

        safeFormData,

        "clientDetails.meetingAttendees.name",

        "",

      ),

      relationship: getSafeValue(

        safeFormData,

        "clientDetails.meetingAttendees.relationship",

        "",

      ),

    },

  };



  // Process other sections with proper fallbacks

  const processedData = {

    clientDetails,

    willInstructions: safeFormData.willInstructions,

    familyProtection: safeFormData.familyProtection,

    lpaInstructions: safeFormData.lpaInstructions,

    idInformation: safeFormData.idInformation,

    signatures: safeFormData.signatures,

  };



  // Debug: Log signatures specifically

  console.log("=== SIGNATURES IN PDF GENERATION ===");

  console.log("Signatures object:", safeFormData.signatures);

  console.log("Client 1 signature exists:", !!safeFormData.signatures?.client1);

  console.log("Client 2 signature exists:", !!safeFormData.signatures?.client2);

  if (safeFormData.signatures?.client1) {

    console.log(

      "Client 1 signature type:",

      typeof safeFormData.signatures.client1,

    );

    console.log(

      "Client 1 signature starts with:",

      safeFormData.signatures.client1.substring(0, 50) + "...",

    );

  }

  if (safeFormData.signatures?.client2) {

    console.log(

      "Client 2 signature type:",

      typeof safeFormData.signatures.client2,

    );

    console.log(

      "Client 2 signature starts with:",

      safeFormData.signatures.client2.substring(0, 50) + "...",

    );

  }



  // Debug: Log the children data

  console.log(

    "Will Instructions Children Data:",

    safeFormData.willInstructions?.children,

  );



  console.log("=== PROCESSED DATA ===");

  console.log(JSON.stringify(processedData, null, 2));



  // Log each section

  const logSection = (name, data) => {

    console.log(`\n=== ${name.toUpperCase()} ===`);

    if (isEmpty(data)) {

      console.log("No data available");

    } else {

      Object.entries(data).forEach(([key, value]) => {

        console.log(`${key}:`, isEmpty(value) ? "Not provided" : value);

      });

    }

  };



  logSection("Client Details", processedData.clientDetails);

  logSection("Will Instructions", processedData.willInstructions);

  logSection("Family Protection", processedData.familyProtection);

  logSection("LPA Instructions", processedData.lpaInstructions);

  logSection("ID Information", processedData.idInformation);

  logSection("Signatures", processedData.signatures);



  try {

    if (!formData || typeof formData !== "object") {

      throw new Error("Invalid form data provided");

    }



    // Create a new PDF document

    const pdfDoc = await PDFDocument.create();



    // Add fonts

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);



    // Helper function to wrap text manually

    const wrapText = (text, font, maxWidth, lineHeight) => {

      const words = text.split(" ");

      const lines = [];

      let currentLine = "";



      for (const word of words) {

        // Test if adding this word would exceed maxWidth

        const testLine = currentLine + (currentLine ? " " : "") + word;

        const textWidth = font.widthOfTextAtSize(testLine, 10);



        if (textWidth > maxWidth) {

          if (currentLine) {

            lines.push(currentLine);

            currentLine = word;

          } else {

            currentLine = word;

          }

        } else {

          currentLine = testLine;

        }

      }



      if (currentLine) {

        lines.push(currentLine);

      }



      return lines;

    };



    // A4 page size

    const { width, height } = { width: 595.28, height: 841.89 };

    const leftMargin = 50;

    const rightMargin = 50;



    /**

     * Helper: draw a horizontal line that visually represents

     * an input underline on the original paper form.

     */

    const drawUnderline = (page, startX, endX, y, options = {}) => {

      const { thickness = 0.7, color = rgb(0.6, 0.6, 0.6) } = options;



      // Validate coordinates to prevent NaN

      if (isNaN(startX) || isNaN(endX) || isNaN(y)) {

        console.warn(

          "Invalid coordinates in drawUnderline (pdfServiceBlob.js):",

          { startX, endX, y },

        );

        return;

      }



      page.drawLine({

        start: { x: startX, y },

        end: { x: endX, y },

        thickness,

        color,

      });

    };



    /**

     * Helper: draw a label with an underline next to it.

     * This matches the “Label ____________” style on the template.

     */

    const drawLabeledLine = (

      page,

      {

        label,

        value,

        x,

        y,

        lineWidth,

        labelWidth = 90,

        fontSize = 10,

        gap = 6,

        shouldWrapText = false,

        lineHeight = 12,

        dynamicWidth = false,

        minWidth = 100,

        maxWidth = 400,

      },

    ) => {

      // Validate and set defaults for all numeric parameters to prevent NaN

      const safeX = typeof x === "number" && !isNaN(x) ? x : 50;

      const safeY = typeof y === "number" && !isNaN(y) ? y : 0;

      const safeLabelWidth =

        typeof labelWidth === "number" && !isNaN(labelWidth) ? labelWidth : 90;

      const safeGap = typeof gap === "number" && !isNaN(gap) ? gap : 6;

      const safeLineWidth =

        typeof lineWidth === "number" && !isNaN(lineWidth) && lineWidth > 0

          ? lineWidth

          : 200;

      const safeMinWidth =

        typeof minWidth === "number" && !isNaN(minWidth) ? minWidth : 100;

      const safeMaxWidth =

        typeof maxWidth === "number" && !isNaN(maxWidth) ? maxWidth : 400;

      const safeFontSize =

        typeof fontSize === "number" && !isNaN(fontSize) && fontSize > 0

          ? fontSize

          : 10;



      // Validate coordinates to prevent NaN

      if (isNaN(safeX) || isNaN(safeY)) {

        console.warn(

          "Invalid coordinates in drawLabeledLine (pdfServiceBlob.js):",

          { x: safeX, y: safeY },

        );

        return;

      }



      const safeValue = formatValue(value || "");



      // Calculate dynamic line width if enabled

      let calculatedLineWidth = safeLineWidth;

      if (dynamicWidth && safeValue && safeValue !== "Not provided") {

        try {

          const textWidth = font.widthOfTextAtSize(safeValue, safeFontSize);

          // Validate textWidth is a valid number

          const validTextWidth =

            typeof textWidth === "number" && !isNaN(textWidth) && textWidth > 0

              ? textWidth

              : safeMinWidth;

          calculatedLineWidth = Math.max(

            safeMinWidth,

            Math.min(safeMaxWidth, validTextWidth + 10),

          ); // Add 10px padding

        } catch (error) {

          console.warn("Error calculating text width, using default:", error);

          calculatedLineWidth = safeLineWidth;

        }

      }



      // Ensure calculatedLineWidth is a valid number

      if (

        typeof calculatedLineWidth !== "number" ||

        isNaN(calculatedLineWidth) ||

        calculatedLineWidth <= 0

      ) {

        calculatedLineWidth = safeLineWidth;

      }



      // Label

      page.drawText(label || "", {

        x: safeX,

        y: safeY,

        size: safeFontSize,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      const lineStartX = safeX + safeLabelWidth + safeGap;

      const lineEndX = lineStartX + calculatedLineWidth;



      // Final validation before drawing

      if (isNaN(lineStartX) || isNaN(lineEndX) || isNaN(safeY)) {

        console.warn("Invalid calculated coordinates in drawLabeledLine:", {

          lineStartX,

          lineEndX,

          y: safeY,

          x: safeX,

          labelWidth: safeLabelWidth,

          gap: safeGap,

          calculatedLineWidth,

        });

        return;

      }



      // Pre‑filled value (if any)

      if (safeValue && safeValue !== "Not provided") {

        if (shouldWrapText && safeValue.length > 0) {

          // Wrap text for long content like addresses

          const lines = wrapText(

            safeValue,

            font,

            calculatedLineWidth,

            lineHeight,

          );

          lines.forEach((line, index) => {

            page.drawText(line, {

              x: lineStartX + 2,

              y: safeY - index * lineHeight,

              size: safeFontSize,

              font,

              color: rgb(0, 0, 0),

            });



            // Draw underline for each line

            const underlineY = safeY - 2 - index * lineHeight;

            if (!isNaN(underlineY)) {

              drawUnderline(page, lineStartX, lineEndX, underlineY);

            }

          });

        } else {

          // Single line text

          page.drawText(safeValue, {

            x: lineStartX + 2,

            y: safeY,

            size: safeFontSize,

            font,

            color: rgb(0, 0, 0),

          });

        }

      }



      // Underline (draw multiple underlines for wrapped text)

      if (shouldWrapText && safeValue && safeValue !== "Not provided") {

        const lines = wrapText(

          safeValue,

          font,

          calculatedLineWidth,

          lineHeight,

        );

        lines.forEach((line, index) => {

          const underlineY = safeY - 2 - index * lineHeight;

          if (!isNaN(underlineY)) {

            drawUnderline(page, lineStartX, lineEndX, underlineY);

          }

        });

      } else {

        const underlineY = safeY - 2;

        if (!isNaN(underlineY)) {

          drawUnderline(page, lineStartX, lineEndX, underlineY);

        }

      }

    };



    // Helper function to draw consistent section headers

    const drawSectionHeader = (page, title, yPos) => {

      const bandHeight = 26;

      const y = yPos - bandHeight;



      // Draw the dark background band

      page.drawRectangle({

        x: 0,

        y: y,

        width,

        height: bandHeight,

        color: rgb(0.1, 0.1, 0.11),

      });



      // Draw the title text

      page.drawText(title.toUpperCase(), {

        x: 50,

        y: y + 6, // Vertically center in the band

        size: 12,

        font: boldFont,

        color: rgb(1, 1, 1), // White text

      });



      return y - 35; // Return y position for content below the header with more space

    };



    /**

     * Helper: draw a yes/no checkbox row.

     */

    const drawYesNoRow = (

      page,

      {

        label,

        value, // boolean or "yes"/"no"

        x,

        y,

        fontSize = 10,

        gap = 20, // Increased gap between label and checkboxes

      },

    ) => {

      const normalized =

        typeof value === "boolean"

          ? value

          : String(value || "")

            .toLowerCase()

            .startsWith("y");



      const boxSize = 8;

      const checkboxTextGap = 1; // Space between checkbox and its label

      const optionGap = 15; // Space between Yes and No options



      // Draw the question label

      page.drawText(label, {

        x: x + 3,

        y: y + 2, // Align text baseline with checkboxes

        size: fontSize,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      // Calculate starting position for the checkboxes (with more space from label)

      let currentX = x + font.widthOfTextAtSize(label, fontSize) + 30; // Increased space after question



      const drawBox = (checked, text) => {

        // Draw checkbox

        page.drawRectangle({

          x: currentX,

          y: y + 1, // Align checkbox with text baseline

          width: boxSize,

          height: boxSize,

          borderWidth: 0.8,

          borderColor: rgb(0, 0, 0),

        });



        // Draw checkmark if checked

        if (checked) {

          page.drawRectangle({

            x: currentX + 1.5,

            y: y + 1.5, // Adjusted Y position to center the checkmark in the checkbox

            width: boxSize - 3,

            height: boxSize - 3,

            color: rgb(0, 0, 0),

          });

        }



        // Position text next to checkbox

        currentX += boxSize + 8; // Increased space between checkbox and text



        // Draw the text (Yes/No)

        page.drawText(text, {

          x: currentX,

          y: y, // Align text with checkbox

          size: fontSize,

          font,

          color: rgb(0, 0, 0),

        });



        // Move to next checkbox position (with more space between options)

        currentX += font.widthOfTextAtSize(text, fontSize) + 30; // Increased from 'gap' to 30

      };



      // Draw Yes and No boxes

      drawBox(normalized, "Yes");

      drawBox(!normalized, "No");



      return y - 25;

    };



    /**

     * PAGE 1 – CLIENT INFORMATION

     * Following the required flow structure

     */

    let page = pdfDoc.addPage([width, height]);



    const titleText = "The-Planning Bee";

    const titleSize = 18; // Increased from 14 to 18

    const titleWidth = boldFont.widthOfTextAtSize(titleText, titleSize);



    page.drawText(titleText, {

      x: (width - titleWidth) / 2,

      y: height - 56,

      size: titleSize,

      font: boldFont,

      color: rgb(0, 0, 1), // Blue color (RGB: 0, 0, 1)

    });



    let y = height - 110; // Increased from 70 to 90 for more space below title



    // Client reference / Adviser / Date / Case notes

    drawLabeledLine(page, {

      label: "Client Reference",

      value: processedData.clientDetails.clientReference,

      x: 50,

      y,

      lineWidth: 420, // Increased from 300 to 400

      labelWidth: 140, // Increased from 90 to 120

      dynamicWidth: true,

      minWidth: 120, // Increased from 80 to 100

      maxWidth: 380, // Increased from 200 to 350

    });



    y -= 22;



    drawLabeledLine(page, {

      label: "Advisers Name",

      value: processedData.clientDetails.adviserName,

      x: 50,

      y,

      lineWidth: 420, // Increased from 300 to 400

      labelWidth: 140, // Increased from 90 to 120

      dynamicWidth: true,

      minWidth: 170, // Increased from 100 to 150

      maxWidth: 420, // Increased from 250 to 400

    });



    y -= 22;

    y -= 8;



    // Case notes multi‑line area

    page.drawText("Case Notes", {

      x: 50,

      y,

      size: 10,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    // Get case notes with proper fallback

    const caseNotes = getNestedValue(

      processedData,

      "clientDetails.caseNotes",

      "",

    );

    const notesTopY = y - 16;

    const notesLeftMargin = 52;

    const notesRightMargin = 40;

    const notesWidth = width - notesLeftMargin - notesRightMargin;



    // Calculate dynamic height based on content

    let notesHeight = 60; // Default minimum height

    if (caseNotes && caseNotes.trim() !== "") {

      // Calculate how many lines the text will take

      const lines = wrapText(caseNotes, font, notesWidth, 12);

      const calculatedHeight = Math.max(60, lines.length * 12 + 24); // 12px line height + padding

      notesHeight = Math.min(calculatedHeight, 200); // Cap at maximum height to prevent overflow

    }



    // Grey background for notes area

    page.drawRectangle({

      x: 45,

      y: notesTopY - notesHeight,

      width: width - 90,

      height: notesHeight,

      color: rgb(0.96, 0.96, 0.96),

      borderWidth: 0.5,

      borderColor: rgb(0.85, 0.85, 0.85),

    });



    // Only render if there are actual case notes

    if (caseNotes && caseNotes.trim() !== "") {

      // Calculate starting Y position (top of the notes area minus padding)

      const startY = notesTopY - 12;



      // Calculate how many lines the text will take

      const lines = wrapText(caseNotes, font, notesWidth, 12);



      // Draw each line of text

      lines.forEach((line, index) => {

        page.drawText(line, {

          x: notesLeftMargin,

          y: startY - index * 12,

          size: 9,

          font,

          color: rgb(0, 0, 0),

        });

      });

    }



    // Position the client information section with proper spacing from case notes

    y = notesTopY - notesHeight - 35; // Increased space after case notes



    // Black band "CLIENT INFORMATION"

    const bandHeight = 26;

    const bandY = y - bandHeight; // Position band above the current y position



    page.drawRectangle({

      x: 0,

      y: bandY,

      width,

      height: bandHeight,

      color: rgb(0.1, 0.1, 0.11),

    });



    // Draw "CLIENT INFORMATION" text in white for better visibility

    const clientInfoTitle = "CLIENT INFORMATION";

    const clientInfoWidth = boldFont.widthOfTextAtSize(clientInfoTitle, 12);



    page.drawText(clientInfoTitle, {

      x: 50,

      y: bandY + 6, // Vertically center in the band

      size: 12,

      font: boldFont,

      color: rgb(1, 1, 1), // White color for better contrast

    });



    // Helper function to draw section headers

    // const drawSectionHeader = (page, title, yPos) => {

    //   const bandHeight = 22;

    //   const y = yPos - bandHeight;



    //   // Draw the dark background band

    //   page.drawRectangle({

    //     x: 0,

    //     y: y,

    //     width,

    //     height: bandHeight,

    //     color: rgb(0.1, 0.1, 0.11),

    //   });



    //   // Draw the title text

    //   page.drawText(title.toUpperCase(), {

    //     x: 50,

    //     y: y + 5,  // Vertically center in the band

    //     size: 12,

    //     font: boldFont,

    //     color: rgb(1, 1, 1),  // White text

    //   });



    //   return y - 15;  // Return y position for content below the header

    // };



    // Set y position for the content below the client information header

    y = bandY - 50; // Space after the black band



    /**

     * CLIENT 1 & CLIENT 2 section on same page

     */

    const columnMid = width / 2;



    const drawClientBlock = ({ title, prefix, baseY, sectionData }) => {

      let localY = baseY;



      page.drawText(title, {

        x: prefix === "client1" ? 50 : columnMid + 10,

        y: localY,

        size: 11,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      localY -= 18;



      const xBase = prefix === "client1" ? 50 : columnMid + 10;



      drawLabeledLine(page, {

        label: "Full Name",

        value: sectionData.firstName,

        x: xBase,

        y: localY,

        lineWidth: 140,

        dynamicWidth: true,

        minWidth: 80,

        maxWidth: 180,

      });



      localY -= 18;

      localY -= 18;



      drawLabeledLine(page, {

        label: "Address",

        value: sectionData.address,

        x: xBase,

        y: localY,

        lineWidth: 200,

        labelWidth: 60,

        shouldWrapText: true,

        lineHeight: 12,

      });



      localY -= 18;



      drawLabeledLine(page, {

        label: "Marital Status",

        value: sectionData.maritalStatus,

        x: xBase,

        y: localY,

        lineWidth: 120,

        labelWidth: 80,

        dynamicWidth: true,

        minWidth: 80,

        maxWidth: 150,

      });



      localY -= 18;



      drawLabeledLine(page, {

        label: "Mobile",

        value: sectionData.phone || sectionData.mobile,

        x: xBase,

        y: localY,

        lineWidth: 120,

        labelWidth: 50,

        dynamicWidth: true,

        minWidth: 80,

        maxWidth: 140,

      });



      return localY;

    };



    const client1 = {

      firstName: getSafeValue(safeFormData, "clientDetails.firstName", ""),

      lastName: getSafeValue(safeFormData, "clientDetails.lastName", ""),

      surname: getSafeValue(safeFormData, "clientDetails.lastName", ""),

      address: getSafeValue(safeFormData, "clientDetails.address", ""),

      maritalStatus: getSafeValue(

        safeFormData,

        "clientDetails.maritalStatus",

        "",

      ),

      mobile: getSafeValue(safeFormData, "clientDetails.mobile", ""),

      phone: getSafeValue(safeFormData, "clientDetails.telephone", ""),

      email: getSafeValue(safeFormData, "clientDetails.email", ""),

      dob: getSafeValue(safeFormData, "clientDetails.dob", ""),

      title: getSafeValue(safeFormData, "clientDetails.title", ""),

    };



    const client2 = {

      firstName: getSafeValue(safeFormData, "clientDetails.firstName2", ""),

      lastName: getSafeValue(safeFormData, "clientDetails.lastName2", ""),

      surname: getSafeValue(safeFormData, "clientDetails.lastName2", ""),

      address:

        getSafeValue(safeFormData, "clientDetails.address2", "") ||

        client1.address,

      maritalStatus: getSafeValue(

        safeFormData,

        "clientDetails.maritalStatus2",

        "",

      ),

      mobile: getSafeValue(safeFormData, "clientDetails.mobile2", ""),

      phone: getSafeValue(safeFormData, "clientDetails.telephone2", ""),

      email: getSafeValue(safeFormData, "clientDetails.email2", ""),

      dob: getSafeValue(safeFormData, "clientDetails.dob2", ""),

      title: getSafeValue(safeFormData, "clientDetails.title2", ""),

    };



    // Function to draw client information side by side

    const drawClientInfoSideBySide = (client1, client2, startY) => {

      const columnMid = width / 2;

      const leftX = 50;

      const rightX = columnMid + 30; // Increased from +10 to +30 to give more space to CLIENT 1

      let currentY = startY;



      // Draw client titles

      page.drawText("CLIENT 1", {

        x: leftX,

        y: currentY,

        size: 11,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      page.drawText("CLIENT 2", {

        x: rightX,

        y: currentY,

        size: 11,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      currentY -= 18; // Space below titles



      // Define fields to draw

      const fields = [

        { label: "Title", key: "title", lineWidth: 100, labelWidth: 35 },

        {

          label: "First Names",

          key: "firstName",

          lineWidth: 120,

          labelWidth: 60,

        },

        { label: "Surname", key: "lastName", lineWidth: 120, labelWidth: 60 },

        { label: "Date of Birth", key: "dob", lineWidth: 100, labelWidth: 70 },

        { label: "Telephone", key: "phone", lineWidth: 120, labelWidth: 60 },

        { label: "Mobile", key: "mobile", lineWidth: 120, labelWidth: 50 },

        { label: "Email", key: "email", lineWidth: 140, labelWidth: 40 },

        {

          label: "Marital Status",

          key: "maritalStatus",

          lineWidth: 100,

          labelWidth: 70,

        },

        {

          label: "Address",

          key: "address",

          lineWidth: 160,

          labelWidth: 50,

          shouldWrapText: true,

          lineHeight: 12,

        },

      ];



      // Draw each field for both clients side by side

      fields.forEach((field) => {

        // Client 1 field

        drawLabeledLine(page, {

          label: field.label,

          value: client1[field.key] || "",

          x: leftX,

          y: currentY,

          lineWidth: field.lineWidth,

          labelWidth: field.labelWidth,

          shouldWrapText: field.shouldWrapText || false,

          lineHeight: field.lineHeight || 12,

          dynamicWidth: true,

          minWidth: 80,

          maxWidth: field.lineWidth + 20, // Reduced from +50 to prevent overflow

        });



        // Client 2 field (only if client2 exists)

        if (client2.firstName || client2.lastName) {

          drawLabeledLine(page, {

            label: field.label,

            value: client2[field.key] || "",

            x: rightX,

            y: currentY,

            lineWidth: field.lineWidth,

            labelWidth: field.labelWidth,

            shouldWrapText: field.shouldWrapText || false,

            lineHeight: field.lineHeight || 12,

            dynamicWidth: true,

            minWidth: 80,

            maxWidth: field.lineWidth + 20, // Reduced from +50 to prevent overflow

          });

        }



        // Adjust spacing for wrapped text fields

        if (field.shouldWrapText) {

          const client1Lines = client1[field.key]

            ? wrapText(client1[field.key], font, field.lineWidth, 12)

            : [];

          const client2Lines =

            client2[field.key] && (client2.firstName || client2.lastName)

              ? wrapText(client2[field.key], font, field.lineWidth, 12)

              : [];

          const maxLines = Math.max(client1Lines.length, client2Lines.length);

          if (maxLines > 1) {

            currentY -= (maxLines - 1) * 12; // Add extra space for additional lines

          }

        }



        currentY -= 18; // Base space between fields

      });



      return currentY - 12; // Return final Y position with extra space

    };



    // Draw Client 1 and Client 2 side by side

    let currentY = y;

    currentY = drawClientInfoSideBySide(client1, client2, currentY);



    // Previous Will Section after client information

    const previousWill = getNestedValue(

      processedData,

      "clientDetails.previousWill",

      false,

    );

    if (previousWill) {

      currentY -= 15; // Space before previous will



      // Previous Will heading with content styling

      page.drawText("Previous Will", {

        x: 50,

        y: currentY,

        size: 11,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      currentY -= 18;



      // Previous Will content

      page.drawText("Client has a previous will", {

        x: 50,

        y: currentY,

        size: 9,

        font,

        color: rgb(0, 0, 0),

      });



      currentY -= 10; // Extra space after previous will

    }



    // Meeting Attendees Section after client information

    const meetingAttendees = getNestedValue(

      processedData,

      "clientDetails.meetingAttendees",

      {},

    );

    if (meetingAttendees.isAnyoneElsePresent) {

      currentY -= 20; // Space before meeting attendees



      // Meeting Attendees heading with content styling

      page.drawText("Meeting Attendees", {

        x: 50,

        y: currentY,

        size: 11,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      currentY -= 18;



      // Meeting Attendees content - display name on left and relationship on right

      const columnMid = width / 2;

      const leftX = 50;

      const rightX = columnMid + 30;



      if (meetingAttendees.name || meetingAttendees.relationship) {

        // Draw Name on left side

        drawLabeledLine(page, {

          label: "Name",

          value: meetingAttendees.name || "",

          x: leftX,

          y: currentY,

          lineWidth: 120,

          labelWidth: 35,

          dynamicWidth: true,

          minWidth: 80,

          maxWidth: 140,

        });



        // Draw Relationship on right side

        drawLabeledLine(page, {

          label: "Relationship",

          value: meetingAttendees.relationship || "",

          x: rightX,

          y: currentY,

          lineWidth: 120,

          labelWidth: 70,

          dynamicWidth: true,

          minWidth: 80,

          maxWidth: 140,

        });



        currentY -= 18;

      }



      currentY -= 80; // Extra space after meeting attendees

    }



    // Official use only / Services required block (bottom of first page)

    const services = getSafeValue(

      safeFormData,

      "clientDetails.servicesRequired",

      {},

    );

    const selectedServices = services.selectedServices || [];

    const otherServices = Array.isArray(services.otherServices)

      ? services.otherServices.join(", ")

      : "";



    // Draw the grey box first

    const officialBoxHeight = 60;

    const officialY = 60; // Position for the grey box



    // Draw the grey background box

    page.drawRectangle({

      x: 40,

      y: officialY,

      width: width - 80,

      height: officialBoxHeight,

      color: rgb(0.95, 0.95, 0.95), // Light grey color

      borderWidth: 0.5,

      borderColor: rgb(0.8, 0.8, 0.8),

      borderRadius: 5,

    });



    // Draw "Official use only" text above the grey box

    let oy = officialY + officialBoxHeight + 10; // Position above the box



    page.drawText("Official use only:", {

      x: 40,

      y: oy,

      size: 10,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    oy -= 25; // Space before checkboxes



    const drawSimpleBox = (label, checked, xPos) => {

      const boxSize = 8;

      const bx = xPos;



      // Draw the checkbox

      page.drawRectangle({

        x: bx,

        y: oy - boxSize + 2,

        width: boxSize,

        height: boxSize,

        borderWidth: 0.8,

        borderColor: rgb(0, 0, 0),

      });



      if (checked) {

        page.drawRectangle({

          x: bx + 1.5,

          y: oy - boxSize + 3.5,

          width: boxSize - 3,

          height: boxSize - 3,

          color: rgb(0, 0, 0),

        });

      }



      // Draw the label text to the right of the checkbox, vertically aligned

      const textY = oy - boxSize + 4;

      page.drawText(label, {

        x: bx + boxSize + 6,

        y: textY,

        size: 9,

        font,

        color: rgb(0, 0, 0),

      });

    };



    // Check actual services from data and mark checkboxes accordingly

    drawSimpleBox("Wills", selectedServices.includes("wills"), 55);

    drawSimpleBox("LPAs", selectedServices.includes("lpas"), 120);

    drawSimpleBox("Disc Trust", selectedServices.includes("discTrust"), 185);

    drawSimpleBox("PPT", selectedServices.includes("ppt"), 275);

    drawSimpleBox("BPRT", selectedServices.includes("bprt"), 330);

    drawSimpleBox("FLIT", selectedServices.includes("flit"), 390);

    drawSimpleBox("VPT", selectedServices.includes("vpt"), 440);

    drawSimpleBox("FPT", selectedServices.includes("fpt"), 490);



    oy -= 20;



    page.drawText("Other:", {

      x: 55,

      y: oy,

      size: 9,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    if (otherServices) {

      page.drawText(otherServices, {

        x: 95,

        y: oy,

        size: 9,

        font,

        color: rgb(0, 0, 0),

        maxWidth: width - 130,

      });

    }



    // CHILDREN, CONCERNS & EXCLUSIONS, FINANCIAL INFO, GUARDIANS, FUNERAL, EXECUTORS

    // will continue on subsequent pages to keep code maintainable and

    // to better match the multi‑page paper template.



    // For now we add a second page that focuses on children & financial info.

    let page2 = pdfDoc.addPage([width, height]);

    let y2 = height - 60;



    // WILL INSTRUCTION SECTION HEADER

    y2 = drawSectionHeader(page2, "WILL INSTRUCTION", y2 + 4);

    y2 -= 10; // Space after header



    // CHILDREN SECTION HEADER

    y2 = drawSectionHeader(page2, "CHILDREN", y2 + 4);

    y2 -= 10; // Space after header



    const children = Array.isArray(processedData.willInstructions.children)

      ? processedData.willInstructions.children

      : [];



    // Only render as many CHILD sections as there are actual children

    const maxChildren = children.length;



    for (let i = 0; i < maxChildren; i++) {

      const child = children[i] || {};



      // Draw the child number above the box with more space

      page2.drawText(`CHILD ${i + 1}`, {

        x: 45,

        y: y2 + 3, // Slightly lower position

        size: 10,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      // Position the box below the heading with more space

      y2 -= 15; // Increased space between heading and box



      // Alternate grey backgrounds to mimic template bands

      const bandHeight = 130;

      const isEven = i % 2 === 0;



      // Draw the grey box

      page2.drawRectangle({

        x: 35,

        y: y2 - bandHeight + 10,

        width: width - 70,

        height: bandHeight,

        color: isEven ? rgb(0.94, 0.94, 0.95) : rgb(0.98, 0.98, 0.98),

      });



      // Left column

      let cy = y2 - 12;



      drawLabeledLine(page2, {

        label: "Title",

        value: getSafeValue(child, "title", ""),

        x: 45,

        y: cy,

        lineWidth: 80,

        dynamicWidth: true,

        minWidth: 50,

        maxWidth: 100,

      });



      cy -= 16;



      drawLabeledLine(page2, {

        label: "Full Name",

        value: getSafeValue(child, "fullName", ""),

        x: 45,

        y: cy,

        lineWidth: 150,

        dynamicWidth: true,

        minWidth: 100,

        maxWidth: 200,

      });



      cy -= 16;



      drawLabeledLine(page2, {

        label: "Date of Birth",

        value: getSafeValue(child, "dob", ""),

        x: 45,

        y: cy,

        lineWidth: 100,

        dynamicWidth: true,

        minWidth: 80,

        maxWidth: 120,

      });



      cy -= 16;



      // Address field taking FULL WIDTH (like relationship field)

      drawLabeledLine(page2, {

        label: "Address",

        value: getSafeValue(child, "address", ""), // Show address directly in the labeled line

        x: 45,

        y: cy,

        lineWidth: 450, // Extended to full row width

        labelWidth: 55,

        shouldWrapText: true,

        lineHeight: 12,

        dynamicWidth: true,

        minWidth: 150,

        maxWidth: 450,

      });



      cy -= 25; // Extra space before relationship field



      // Adjust spacing based on address length

      const address = getSafeValue(child, "address", "");

      if (address && address.length > 30) {

        const addressLines = wrapText(address, font, 450, 12);

        cy -= (addressLines.length - 1) * 12; // Add extra space for additional lines

      }



      // Relationship to Client 1 (NEXT ROW)

      page2.drawText("Relationship to:", {

        x: 45,

        y: cy,

        size: 9,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      cy -= 16;



      drawLabeledLine(page2, {

        label: "Client 1",

        value: getSafeValue(child, "relationshipClient1", ""),

        x: 45,

        y: cy,

        lineWidth: 110,

        labelWidth: 55,

        dynamicWidth: true,

        minWidth: 80,

        maxWidth: 150,

      });



      cy -= 16;



      drawLabeledLine(page2, {

        label: "Client 2",

        value: getSafeValue(child, "relationshipClient2", ""),

        x: 45,

        y: cy,

        lineWidth: 110,

        labelWidth: 55,

        dynamicWidth: true,

        minWidth: 80,

        maxWidth: 150,

      });



      // Increased spacing between child sections

      y2 -= bandHeight + 25; // Increased from 5 to 25 for more space between children



      if (y2 < 180 && i < maxChildren - 1) {

        // Increased threshold from 140 to 180 to account for larger spacing

        // New page for remaining children

        page2 = pdfDoc.addPage([width, height]);

        y2 = height - 60;

      }

    }



    // CHILDREN CONCERNS / EXCLUSIONS

    if (y2 < 160) {

      // Further reduced threshold for page break

      page2 = pdfDoc.addPage([width, height]);

      y2 = height - 90; // Start even lower on the new page

    }



    const drawTextAreaBlock = ({ page: pg, heading, label, value, topY }) => {

      pg.drawText(heading, {

        x: 50,

        y: topY,

        size: 10,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      pg.drawText(label, {

        x: 50,

        y: topY - 14,

        size: 9,

        font,

        color: rgb(0, 0, 0),

      });



      const boxY = topY - 24;

      const boxHeight = 70;



      pg.drawRectangle({

        x: 45,

        y: boxY - boxHeight,

        width: width - 90,

        height: boxHeight,

        color: rgb(0.96, 0.96, 0.96),

        borderWidth: 0.5,

        borderColor: rgb(0.85, 0.85, 0.85),

      });



      if (value && value !== "Not provided") {

        // Draw text inside grey box with proper wrapping

        const textLines = wrapText(value, font, width - 110, 9);



        // Start text from top of box with proper padding

        const startY = boxY - 15; // Start from top of box

        const lineHeight = 11;



        textLines.forEach((line, lineIndex) => {

          const lineY = startY - lineIndex * lineHeight;



          // Only draw if text is still within box bounds

          if (lineY > boxY - boxHeight + 10) {

            pg.drawText(line, {

              x: 52,

              y: lineY,

              size: 9,

              font,

              color: rgb(0, 0, 0),

            });

          }

        });

      }



      return boxY - boxHeight - 20;

    };



    const childrenConcerns = getSafeValue(

      formData,

      "willInstructions.childrenConcernsDetails",

      "",

    );



    const hasChildrenConcerns = getSafeValue(

      formData,

      "willInstructions.hasChildrenConcerns",

      "",

    );



    y2 -= 15; // Add extra space before children concerns question



    drawYesNoRow(page2, {

      label:

        "Are there any concerns about children's relationships, finances, disabilities or vulnerabilities?",

      value: hasChildrenConcerns,

      x: 35,

      y: y2,

    });



    y2 -= 20;



    y2 = drawTextAreaBlock({

      page: page2,

      heading: "",

      label: "If yes, details?",

      value: childrenConcerns,

      topY: y2,

    });



    const hasDisinheritance = getSafeValue(

      formData,

      "willInstructions.hasDisinheritance",

      "",

    );



    drawYesNoRow(page2, {

      label: "Are there any children to be deliberately excluded?",

      value: hasDisinheritance,

      x: 50,

      y: y2,

    });



    y2 -= 20; // Further reduced vertical spacing after excluded children question



    const disinherited = getSafeValue(

      formData,

      "willInstructions.disinheritedChildren",

      [],

    );



    const disinheritText = Array.isArray(disinherited)

      ? disinherited

        .map(

          (d, idx) =>

            `${idx + 1}. ${d.name || "Name not provided"} – ${d.relationship || "Relationship not provided"

            }`,

        )

        .join("\n")

      : formatValue(disinherited, {});



    // Draw the label above the box

    page2.drawText("If yes, names and relationships?", {

      x: 50,

      y: y2,

      size: 10,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    // Position the grey box below the label with some spacing

    const boxY = y2 - 15; // Position the box below the label with some space

    const boxHeight = 50; // Height of the grey box



    // Draw the grey background

    page2.drawRectangle({

      x: 50,

      y: boxY - boxHeight, // Adjust Y position to be below the label

      width: width - 100, // Full width with margins

      height: boxHeight,

      color: rgb(0.9, 0.9, 0.9), // Light grey color

    });



    // Draw the excluded children text inside the box

    if (disinheritText) {

      const lines = disinheritText.split("\n");

      let textY = boxY - 20; // Start from top of box with some padding



      lines.forEach((line) => {

        if (line.trim()) {

          page2.drawText(line, {

            x: 60, // Indent from left

            y: textY,

            size: 10,

            font, // Using the standard font

            color: rgb(0, 0, 0),

          });

          textY -= 12; // Line height

        }

      });

    }



    y2 = boxY - 5; // Further reduced vertical spacing after grey box



    /**

     * FINANCIAL INFORMATION (foreign property + assets/liabilities)

     * Separate page to keep layout close to the template table.

     */

    const page3 = pdfDoc.addPage([width, height]);

    // Validate height before calculating y3

    const safeHeight =

      typeof height === "number" && !isNaN(height) ? height : 841.89;

    let y3 = safeHeight - 80; // Start lower on the financial info page



    // Ensure y3 is valid

    if (isNaN(y3) || y3 < 0) {

      console.warn("Invalid y3 calculated, using default:", y3);

      y3 = safeHeight - 80;

    }



    // Section band - reduced height

    page3.drawRectangle({

      x: 0,

      y: y3,

      width,

      height: 26,

      color: rgb(0.1, 0.1, 0.11),

    });



    page3.drawText("FINANCIAL INFORMATION", {

      x: 50,

      y: y3 + 8,

      size: 12,

      font: boldFont,

      color: rgb(1, 1, 1),

    });



    y3 -= 40;



    const financialInfo = processedData.willInstructions.financialInfo || {};



    drawYesNoRow(page3, {

      label: "Do you own any foreign property?",

      value: financialInfo.hasForeignProperty,

      x: 50,

      y: y3,

    });



    y3 -= 25;



    drawLabeledLine(page3, {

      label: "If yes, where?",

      value: financialInfo.foreignLocation,

      x: 50,

      y: y3,

      lineWidth: 260,

      labelWidth: 80,

      dynamicWidth: true,

      minWidth: 150,

      maxWidth: 300,

    });



    y3 -= 35;



    drawYesNoRow(page3, {

      label: "Is there a Will in that country",

      value: financialInfo.hasForeignWill,

      x: 50,

      y: y3,

    });



    y3 -= 25;



    drawYesNoRow(page3, {

      label: "Mention in this Will?",

      value: financialInfo.mentionInThisWill,

      x: 50,

      y: y3,

    });



    y3 -= 40;



    // Assets & Liabilities tables (simplified but aligned with template)

    const drawMoneyTable = ({ page: pg, heading, rows, startY }) => {

      // Validate startY to prevent NaN

      const safeStartY =

        typeof startY === "number" && !isNaN(startY) ? startY : height - 100;



      pg.drawText(heading || "", {

        x: 50,

        y: safeStartY,

        size: 10,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      const colJointX = 260;

      const colC1X = 340;

      const colC2X = 420;



      pg.drawText("Joint", {

        x: colJointX,

        y: safeStartY,

        size: 9,

        font: boldFont,

        color: rgb(0, 0, 0),

      });

      pg.drawText("Client 1", {

        x: colC1X,

        y: safeStartY,

        size: 9,

        font: boldFont,

        color: rgb(0, 0, 0),

      });

      pg.drawText("Client 2", {

        x: colC2X,

        y: safeStartY,

        size: 9,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      let rowY = safeStartY - 16;



      const safeRows = Array.isArray(rows) ? rows : [];



      safeRows.forEach((row) => {

        // Validate rowY before using it

        if (isNaN(rowY) || rowY < 0) {

          console.warn("Invalid rowY in drawMoneyTable, skipping row");

          return;

        }



        pg.drawText(row.label || "", {

          x: 50,

          y: rowY,

          size: 9,

          font,

          color: rgb(0, 0, 0),

        });



        const writeMoney = (val, xCol) => {

          // Validate xCol to prevent NaN

          const safeXCol = typeof xCol === "number" && !isNaN(xCol) ? xCol : 0;

          const safeRowY = typeof rowY === "number" && !isNaN(rowY) ? rowY : 0;



          if (isNaN(safeXCol) || isNaN(safeRowY)) {

            console.warn("Invalid coordinates in writeMoney:", {

              xCol: safeXCol,

              rowY: safeRowY,

            });

            return;

          }



          const txt =

            val !== undefined && val !== null && String(val).trim() !== ""

              ? `£${val}`

              : "";

          if (txt) {

            pg.drawText(txt, {

              x: safeXCol,

              y: safeRowY,

              size: 9,

              font,

              color: rgb(0, 0, 0),

            });

          }



          const underlineStartX = safeXCol - 5;

          const underlineEndX = safeXCol + 55;

          const underlineY = safeRowY - 2;



          if (

            !isNaN(underlineStartX) &&

            !isNaN(underlineEndX) &&

            !isNaN(underlineY)

          ) {

            drawUnderline(pg, underlineStartX, underlineEndX, underlineY);

          }

        };



        writeMoney(row.joint, colJointX);

        writeMoney(row.c1, colC1X);

        writeMoney(row.c2, colC2X);



        rowY -= 16;

      });



      return rowY - 12; // Further reduced vertical spacing in money table

    };



    y3 = drawMoneyTable({

      page: page3,

      heading: "Assets",

      rows: financialInfo.assets || [],

      startY: y3,

    });



    y3 = drawMoneyTable({

      page: page3,

      heading: "Liabilities",

      rows: financialInfo.liabilities || [],

      startY: y3,

    });



    // Calculate and display totals and net estate

    const assets = financialInfo.assets || [];

    const liabilities = financialInfo.liabilities || [];



    const calculateTotals = (items) => {

      return items.reduce(

        (acc, item) => {

          const joint = parseFloat(item.joint) || 0;

          const c1 = parseFloat(item.c1) || 0;

          const c2 = parseFloat(item.c2) || 0;

          return {

            joint: acc.joint + joint,

            c1: acc.c1 + c1,

            c2: acc.c2 + c2,

            total: acc.total + joint + c1 + c2,

          };

        },

        { joint: 0, c1: 0, c2: 0, total: 0 },

      );

    };



    const assetTotals = calculateTotals(assets);

    const liabilityTotals = calculateTotals(liabilities);



    const netEstate = {

      joint: assetTotals.joint - liabilityTotals.joint,

      c1: assetTotals.c1 - liabilityTotals.c1,

      c2: assetTotals.c2 - liabilityTotals.c2,

      total: assetTotals.total - liabilityTotals.total,

    };



    // Display totals

    y3 -= 10;



    // Assets Total

    page3.drawText("Total Assets:", {

      x: 50,

      y: y3,

      size: 10,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    const writeTotal = (val, xCol) => {

      // Validate inputs to prevent NaN

      const safeVal = typeof val === "number" && !isNaN(val) ? val : 0;

      const safeXCol = typeof xCol === "number" && !isNaN(xCol) ? xCol : 0;

      const safeY3 = typeof y3 === "number" && !isNaN(y3) ? y3 : 0;



      if (isNaN(safeXCol) || isNaN(safeY3)) {

        console.warn("Invalid coordinates in writeTotal:", {

          xCol: safeXCol,

          y3: safeY3,

        });

        return;

      }



      const txt = `£${safeVal.toFixed(2)}`;

      page3.drawText(txt, {

        x: safeXCol,

        y: safeY3,

        size: 9,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      const underlineStartX = safeXCol - 5;

      const underlineEndX = safeXCol + 55;

      const underlineY = safeY3 - 2;



      if (

        !isNaN(underlineStartX) &&

        !isNaN(underlineEndX) &&

        !isNaN(underlineY)

      ) {

        drawUnderline(page3, underlineStartX, underlineEndX, underlineY);

      }

    };



    writeTotal(assetTotals.joint, 260);

    writeTotal(assetTotals.c1, 340);

    writeTotal(assetTotals.c2, 420);



    y3 -= 16;



    // Liabilities Total

    page3.drawText("Total Liabilities:", {

      x: 50,

      y: y3,

      size: 10,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    writeTotal(liabilityTotals.joint, 260);

    writeTotal(liabilityTotals.c1, 340);

    writeTotal(liabilityTotals.c2, 420);



    y3 -= 20;



    // Net Estate

    page3.drawText("Net Estate:", {

      x: 50,

      y: y3,

      size: 11,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    const writeNetEstate = (val, xCol) => {

      // Validate inputs to prevent NaN

      const safeVal = typeof val === "number" && !isNaN(val) ? val : 0;

      const safeXCol = typeof xCol === "number" && !isNaN(xCol) ? xCol : 0;

      const safeY3 = typeof y3 === "number" && !isNaN(y3) ? y3 : 0;



      if (isNaN(safeXCol) || isNaN(safeY3)) {

        console.warn("Invalid coordinates in writeNetEstate:", {

          xCol: safeXCol,

          y3: safeY3,

        });

        return;

      }



      const txt = `£${safeVal.toFixed(2)}`;

      page3.drawText(txt, {

        x: safeXCol,

        y: safeY3,

        size: 10,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      // Single underline for net estate

      const underlineStartX = safeXCol - 5;

      const underlineEndX = safeXCol + 55;

      const underlineY = safeY3 - 2;



      if (

        !isNaN(underlineStartX) &&

        !isNaN(underlineEndX) &&

        !isNaN(underlineY)

      ) {

        drawUnderline(page3, underlineStartX, underlineEndX, underlineY);

      }

    };



    writeNetEstate(netEstate.joint, 260);

    writeNetEstate(netEstate.c1, 340);

    writeNetEstate(netEstate.c2, 420);



    /**

     * FUNERAL WISHES SECTION

     * Order: 4. Funeral Wishes (after Financial Information)

     */

    let page4 = pdfDoc.addPage([width, height]);

    let y4 = height - 60;



    // Draw section header

    y4 = drawSectionHeader(page4, "FUNERAL ARRANGEMENTS", y4 + 4);

    y4 -= 10; // Space after header



    const funeral = getSafeValue(

      formData,

      "willInstructions.funeralWishes",

      {},

    );



    const wishes = funeral.client1Wishes || {};



    const drawFuneralOption = (label, key) => {

      drawLabeledLine(page4, {

        label,

        value: wishes[key] ? "Yes" : "",

        x: 50,

        y: y4,

        lineWidth: 120,

        labelWidth: 70,

      });

      y4 -= 16;

    };



    drawFuneralOption("Cremation", "cremation");

    drawFuneralOption("Burial", "burial");

    drawFuneralOption("Undecided", "undecided");



    // Client 1 Other Funeral Wishes - Grey Box

    const client1Other = funeral.client1Other || "";

    if (client1Other) {

      // Draw "Other" heading

      page4.drawText("Other:", {

        x: 50,

        y: y4,

        size: 9,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      y4 -= 0; // Space after heading



      // Calculate dynamic height for client 1 other box

      const lineHeight = 12;

      const maxWidth = width - 110;

      const padding = 16; // Top and bottom padding



      // Calculate text height

      let textHeight = 0;

      const words = client1Other.split(" ");

      let currentLine = "";

      let lines = [];



      for (const word of words) {

        const testLine = currentLine ? `${currentLine} ${word}` : word;

        const testWidth = font.widthOfTextAtSize(testLine, 9);



        if (testWidth <= maxWidth) {

          currentLine = testLine;

        } else {

          if (currentLine) lines.push(currentLine);

          currentLine = word;

        }

      }

      if (currentLine) lines.push(currentLine);



      textHeight = lines.length * lineHeight;



      // Dynamic box height based on text content

      const boxHeight = textHeight + padding;

      const boxY = y4 - boxHeight - 10;



      // Draw grey box

      page4.drawRectangle({

        x: 45,

        y: boxY,

        width: width - 90,

        height: boxHeight,

        color: rgb(0.96, 0.96, 0.96),

        borderWidth: 0.5,

        borderColor: rgb(0.85, 0.85, 0.85),

      });



      // Draw text inside box

      page4.drawText(client1Other, {

        x: 52,

        y: boxY + boxHeight - 12, // Adjusted for dynamic height

        size: 9,

        font,

        color: rgb(0, 0, 0),

        maxWidth: width - 110,

        lineHeight: 12,

      });



      y4 = boxY - 10;

    }



    y4 -= 24;



    // Client 2 Funeral Wishes

    const client2Wishes = funeral.client2Wishes || {};



    if (

      client2Wishes.cremation ||

      client2Wishes.burial ||

      client2Wishes.undecided ||

      funeral.client2Other

    ) {

      page4.drawText("Client 2 Funeral Wishes", {

        x: 50,

        y: y4,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      y4 -= 18;



      const drawFuneralOption2 = (label, key) => {

        drawLabeledLine(page4, {

          label,

          value: client2Wishes[key] ? "Yes" : "",

          x: 50,

          y: y4,

          lineWidth: 120,

          labelWidth: 70,

        });

        y4 -= 16;

      };



      drawFuneralOption2("Cremation", "cremation");

      drawFuneralOption2("Burial", "burial");

      drawFuneralOption2("Undecided", "undecided");



      // Client 2 Other Funeral Wishes - Grey Box

      const client2Other = funeral.client2Other || "";

      if (client2Other) {

        // Draw "Other" heading

        page4.drawText("Other:", {

          x: 50,

          y: y4,

          size: 9,

          font: boldFont,

          color: rgb(0, 0, 0),

        });



        y4 -= 0; // Space after heading



        // Calculate dynamic height for client 2 other box

        const lineHeight = 12;

        const maxWidth = width - 110;

        const padding = 16; // Top and bottom padding



        // Calculate text height

        let textHeight = 0;

        const words = client2Other.split(" ");

        let currentLine = "";

        let lines = [];



        for (const word of words) {

          const testLine = currentLine ? `${currentLine} ${word}` : word;

          const testWidth = font.widthOfTextAtSize(testLine, 9);



          if (testWidth <= maxWidth) {

            currentLine = testLine;

          } else {

            if (currentLine) lines.push(currentLine);

            currentLine = word;

          }

        }

        if (currentLine) lines.push(currentLine);



        textHeight = lines.length * lineHeight;



        // Dynamic box height based on text content

        const boxHeight = textHeight + padding;

        const boxY = y4 - boxHeight - 10;



        // Draw grey box

        page4.drawRectangle({

          x: 45,

          y: boxY,

          width: width - 90,

          height: boxHeight,

          color: rgb(0.96, 0.96, 0.96),

          borderWidth: 0.5,

          borderColor: rgb(0.85, 0.85, 0.85),

        });



        // Draw text inside box

        page4.drawText(client2Other, {

          x: 52,

          y: boxY + boxHeight - 12, // Adjusted for dynamic height

          size: 9,

          font,

          color: rgb(0, 0, 0),

          maxWidth: width - 110,

          lineHeight: 12,

        });



        y4 = boxY - 10;

      }



      y4 -= 14;

    }



    // Additional Funeral Wishes - Grey Box

    const additionalFuneral = funeral.additionalWishes || "";

    if (additionalFuneral) {

      // Draw "Additional Funeral Wishes" heading

      page4.drawText("Additional Funeral Wishes:", {

        x: 50,

        y: y4,

        size: 9,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      y4 -= 0; // Space after heading



      // Calculate dynamic height for additional funeral box

      const lineHeight = 12;

      const maxWidth = width - 110;

      const padding = 16; // Top and bottom padding



      // Calculate text height

      let textHeight = 0;

      const words = additionalFuneral.split(" ");

      let currentLine = "";

      let lines = [];



      for (const word of words) {

        const testLine = currentLine ? `${currentLine} ${word}` : word;

        const testWidth = font.widthOfTextAtSize(testLine, 9);



        if (testWidth <= maxWidth) {

          currentLine = testLine;

        } else {

          if (currentLine) lines.push(currentLine);

          currentLine = word;

        }

      }

      if (currentLine) lines.push(currentLine);



      textHeight = lines.length * lineHeight;



      // Dynamic box height based on text content

      const boxHeight = textHeight + padding;

      const boxY = y4 - boxHeight - 10;



      // Draw grey box

      page4.drawRectangle({

        x: 45,

        y: boxY,

        width: width - 90,

        height: boxHeight,

        color: rgb(0.96, 0.96, 0.96),

        borderWidth: 0.5,

        borderColor: rgb(0.85, 0.85, 0.85),

      });



      // Draw text inside box

      page4.drawText(additionalFuneral, {

        x: 52,

        y: boxY + boxHeight - 12, // Adjusted for dynamic height

        size: 9,

        font,

        color: rgb(0, 0, 0),

        maxWidth: width - 110,

        lineHeight: 12,

      });



      y4 = boxY - 30;

    }



    /**

     * EXECUTORS SECTION

     * Order: 5. Executors (after Funeral Wishes)

     */

    if (y4 < 150) {

      page4 = pdfDoc.addPage([width, height]);

      y4 = height - 60;

    }



    y4 = drawSectionHeader(page4, "EXECUTORS", y4 + 4);

    y4 -= 10;



    y4 -= 12;



    const client1Executors = getSafeValue(

      formData,

      "willInstructions.client1Executors",

      [],

    );



    const client2Executors = getSafeValue(

      formData,

      "willInstructions.client2Executors",

      [],

    );



    const drawExecutorList = ({ label, list, topY }) => {

      let ey = topY;

      page4.drawText(label, {

        x: 50,

        y: ey,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });

      ey -= 18;



      if (!Array.isArray(list) || list.length === 0) {

        drawLabeledLine(page4, {

          label: "Executors",

          value: "None specified",

          x: 50,

          y: ey,

          lineWidth: 200,

          labelWidth: 70,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 250,

        });

        return ey - 20;

      }



      list.forEach((ex, idx) => {

        drawLabeledLine(page4, {

          label: `${idx + 1}. Title`,

          value: getSafeValue(ex, "title", ""),

          x: 50,

          y: ey,

          lineWidth: 80,

          labelWidth: 60,

          dynamicWidth: true,

          minWidth: 50,

          maxWidth: 100,

        });



        ey -= 16;



        drawLabeledLine(page4, {

          label: `Full Name`,

          value: getSafeValue(ex, "fullName", ""),

          x: 50,

          y: ey,

          lineWidth: 200,

          labelWidth: 70,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 250,

        });



        ey -= 16;



        drawLabeledLine(page4, {

          label: `Relationship`,

          value: getSafeValue(ex, "relationship", ""),

          x: 50,

          y: ey,

          lineWidth: 150,

          labelWidth: 70,

          dynamicWidth: true,

          minWidth: 80,

          maxWidth: 200,

        });



        ey -= 16;



        drawLabeledLine(page4, {

          label: `Address`,

          value: getSafeValue(ex, "address", ""),

          x: 50,

          y: ey,

          lineWidth: width - 150,

          labelWidth: 70,

          dynamicWidth: true,

          minWidth: 150,

          maxWidth: width - 150,

          shouldWrapText: true,

          lineHeight: 12,

        });



        ey -= 20;

      });



      return ey - 10;

    };



    y4 = drawExecutorList({

      label: "Client 1 Executors",

      list: client1Executors,

      topY: y4,

    });



    y4 = drawExecutorList({

      label: "Client 2 Executors",

      list: client2Executors,

      topY: y4,

    });



    const clientsNominatingEachOther = getSafeValue(

      formData,

      "willInstructions.clientsNominatingEachOther",

      "",

    );



    y4 -= 6;



    drawYesNoRow(page4, {

      label: "Are clients nominating each other as executor on first death?",

      value: clientsNominatingEachOther,

      x: 50,

      y: y4,

    });



    y4 -= 40;



    /**

     * LEGACIES/BEQUESTS SECTION

     * Order: 6. Legacies/Bequests (after Executors)

     */

    if (y4 < 150) {

      page4 = pdfDoc.addPage([width, height]);

      y4 = height - 60;

    }



    y4 = drawSectionHeader(page4, "LEGACIES / BEQUESTS", y4 + 4);

    y4 -= 10;



    const bequests = getSafeValue(formData, "willInstructions.bequests", []);



    if (Array.isArray(bequests) && bequests.length > 0) {

      bequests.forEach((bequest, idx) => {

        if (y4 < 200) {

          page4 = pdfDoc.addPage([width, height]);

          y4 = height - 60;

        }



        page4.drawText(`Bequest ${idx + 1}`, {

          x: 50,

          y: y4,

          size: 11,

          font: boldFont,

          color: rgb(0, 0, 0),

        });

        y4 -= 18;



        drawLabeledLine(page4, {

          label: "Gift Type",

          value: bequest.giftType || "",

          x: 50,

          y: y4,

          lineWidth: 200,

          labelWidth: 80,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 250,

        });

        y4 -= 18;



        drawLabeledLine(page4, {

          label: "Beneficiary Name",

          value: bequest.beneficiaryName || "",

          x: 50,

          y: y4,

          lineWidth: 250,

          labelWidth: 100,

          dynamicWidth: true,

          minWidth: 150,

          maxWidth: 300,

        });

        y4 -= 18;



        drawLabeledLine(page4, {

          label: "Relationship",

          value: bequest.relationship || "",

          x: 50,

          y: y4,

          lineWidth: 200,

          labelWidth: 80,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 250,

        });

        y4 -= 18;



        if (bequest.giftType === "Money") {

          drawLabeledLine(page4, {

            label: "Amount",

            value: bequest.amount ? `£${bequest.amount}` : "",

            x: 50,

            y: y4,

            lineWidth: 150,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 200,

          });

          y4 -= 18;

        } else {

          drawLabeledLine(page4, {

            label: "Gift Description",

            value: bequest.giftDescription || "",

            x: 50,

            y: y4,

            lineWidth: 400,

            labelWidth: 100,

            shouldWrapText: true,

            lineHeight: 12,

            dynamicWidth: true,

            minWidth: 200,

            maxWidth: 450,

          });

          y4 -= 30;

        }



        drawLabeledLine(page4, {

          label: "Beneficiary Address",

          value: bequest.beneficiaryAddress || "",

          x: 50,

          y: y4,

          lineWidth: 350, // Same as Other Conditions

          labelWidth: 120,

          shouldWrapText: true,

          lineHeight: 12,

          dynamicWidth: false, // Disabled to allow proper wrapping

          minWidth: 200, // Same as Other Conditions

          maxWidth: 380, // Same as Other Conditions

        });

        y4 -= 30;



        if (bequest.vestingAge) {

          drawLabeledLine(page4, {

            label: "Age of Vesting",

            value: bequest.vestingAge || "",

            x: 50,

            y: y4,

            lineWidth: 100,

            labelWidth: 90,

            dynamicWidth: true,

            minWidth: 80,

            maxWidth: 150,

          });

          y4 -= 18;

        }



        if (bequest.otherConditions) {

          drawLabeledLine(page4, {

            label: "Other Conditions",

            value: bequest.otherConditions || "",

            x: 50,

            y: y4,

            lineWidth: 350, // Same as trust terms - reduced from 400

            labelWidth: 100,

            shouldWrapText: true,

            lineHeight: 12,

            dynamicWidth: true,

            minWidth: 200, // Same as trust terms

            maxWidth: 380, // Same as trust terms - reduced from 450

          });

          y4 -= 30;

        }



        y4 -= 20;

      });

    } else {

      drawLabeledLine(page4, {

        label: "Bequests",

        value: "None specified",

        x: 50,

        y: y4,

        lineWidth: 200,

        labelWidth: 80,

        dynamicWidth: true,

        minWidth: 100,

        maxWidth: 250,

      });

      y4 -= 30;

    }



    /**

     * PROPERTY TRUSTS/ROO SECTION

     * Order: 7. Property Trusts/ROO (after Bequests)

     */

    if (y4 < 150) {

      page4 = pdfDoc.addPage([width, height]);

      y4 = height - 60;

    }



    y4 = drawSectionHeader(page4, "PROPERTY TRUSTS / ROO", y4 + 4);

    y4 -= 10;



    const propertyTrusts = getSafeValue(

      formData,

      "willInstructions.propertyTrusts",

      [],

    );



    console.log("=== PROPERTY TRUSTS DEBUG ===");

    console.log("Property Trusts Data:", propertyTrusts);

    console.log("Is Array:", Array.isArray(propertyTrusts));

    console.log("Length:", propertyTrusts.length);



    if (Array.isArray(propertyTrusts) && propertyTrusts.length > 0) {

      propertyTrusts.forEach((trust, idx) => {

        if (y4 < 350) {

          // Increased threshold from 250 to 350

          page4 = pdfDoc.addPage([width, height]);

          y4 = height - 60;

        }



        page4.drawText(`Property Trust ${idx + 1}`, {

          x: 50,

          y: y4,

          size: 11,

          font: boldFont,

          color: rgb(0, 0, 0),

        });

        y4 -= 18;



        // 1. Trust Type

        drawLabeledLine(page4, {

          label: "Trust Type",

          value: trust.trustType || "",

          x: 50,

          y: y4,

          lineWidth: 200,

          labelWidth: 80,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 250,

        });

        y4 -= 18;



        // 2. Who requires this trust?

        if (trust.whoRequires) {

          drawLabeledLine(page4, {

            label: "Who Requires Trust",

            value: trust.whoRequires || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        // 3. Property Address

        drawLabeledLine(page4, {

          label: "Property Address",

          value: trust.propertyAddress || "",

          x: 50,

          y: y4,

          lineWidth: 400,

          labelWidth: 100,

          shouldWrapText: true,

          lineHeight: 12,

          dynamicWidth: true,

          minWidth: 200,

          maxWidth: 450,

        });



        // Calculate how much space the address actually took

        const addressLines = trust.propertyAddress

          ? wrapText(trust.propertyAddress, font, 400, 12).length

          : 1;

        y4 -= 30 + (addressLines > 1 ? (addressLines - 1) * 12 : 0);



        // Check if we need a new page after the address field

        if (y4 < 200) {

          page4 = pdfDoc.addPage([width, height]);

          y4 = height - 60;



          // Redraw section header on new page

          page4.drawText(`Property Trust ${idx + 1} (continued)`, {

            x: 50,

            y: y4,

            size: 11,

            font: boldFont,

            color: rgb(0, 0, 0),

          });

          y4 -= 18;

        }



        // 4. Is a transfer to joint names required?

        drawYesNoRow(page4, {

          label: "Transfer to Joint Names",

          value: trust.transferToJointNames === "yes",

          x: 50,

          y: y4,

        });

        y4 -= 25;



        // 5. Is a SEV of tenancy required?

        drawYesNoRow(page4, {

          label: "Severance of Tenancy Required",

          value: trust.sevOfTenancyRequired === "yes",

          x: 50,

          y: y4,

        });

        y4 -= 25;



        // 6. Who is the Occupant/Life Tenant?

        if (

          trust.occupantLifeTenant &&

          typeof trust.occupantLifeTenant === "object"

        ) {

          const occupant = trust.occupantLifeTenant;

          let occupantText = [];



          if (occupant.client1) occupantText.push("Client 1");

          if (occupant.client2) occupantText.push("Client 2");

          if (occupant.both) occupantText.push("Both");

          if (occupant.other) {

            occupantText.push("Other");

            if (occupant.otherName)

              occupantText.push(`(${occupant.otherName})`);

            if (occupant.otherDetails)

              occupantText.push(`- ${occupant.otherDetails}`);

          }



          if (occupantText.length > 0) {

            drawLabeledLine(page4, {

              label: "Occupant/Life Tenant",

              value: occupantText.join(" "),

              x: 50,

              y: y4,

              lineWidth: 400,

              labelWidth: 120,

              shouldWrapText: true,

              lineHeight: 12,

              dynamicWidth: true,

              minWidth: 200,

              maxWidth: 450,

            });

            y4 -= 18;

          }

        }



        // 7. Period of tenancy?

        if (trust.periodOfTenancy) {

          drawLabeledLine(page4, {

            label: "Period of Tenancy",

            value: trust.periodOfTenancy || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        // Fixed Term (if period is fixed)

        if (trust.fixedTerm) {

          drawLabeledLine(page4, {

            label: "Fixed Term",

            value: trust.fixedTerm || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        // 8. Will life tenant end on?

        if (trust.lifeTenantEndsOn) {

          const lifeTenantEndsOn = trust.lifeTenantEndsOn;



          if (lifeTenantEndsOn.cohabitation !== undefined) {

            drawYesNoRow(page4, {

              label: "Life Tenant Ends On - Cohabitation",

              value: lifeTenantEndsOn.cohabitation === true,

              x: 50,

              y: y4,

            });

            y4 -= 25;

          }



          if (lifeTenantEndsOn.marriage !== undefined) {

            drawYesNoRow(page4, {

              label: "Life Tenant Ends On - Marriage",

              value: lifeTenantEndsOn.marriage === true,

              x: 50,

              y: y4,

            });

            y4 -= 25;

          }



          if (lifeTenantEndsOn.age !== undefined) {

            drawYesNoRow(page4, {

              label: "Life Tenant Ends On - Age",

              value: lifeTenantEndsOn.age === true,

              x: 50,

              y: y4,

            });

            y4 -= 25;

          }

        }



        // 9. Is this a flexible life interest trust?

        if (trust.flexibleLifeInterestTrust) {

          drawLabeledLine(page4, {

            label: "Flexible Life Interest Trust",

            value: trust.flexibleLifeInterestTrust || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            gap: 15, // Increased gap between label and content

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        // 10. Is there a right to substitute?

        if (trust.rightToSubstitute) {

          drawLabeledLine(page4, {

            label: "Right to Substitute",

            value: trust.rightToSubstitute || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        // 11. In the event of a downsizing what happens to the surplus?

        if (trust.downsizingSurplus) {

          drawLabeledLine(page4, {

            label: "Downsizing Surplus",

            value: trust.downsizingSurplus || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        // Downsizing Other details

        if (trust.downsizingOther) {

          drawLabeledLine(page4, {

            label: "Downsizing Other",

            value: trust.downsizingOther || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        // 12. What happens when the trust period ends?

        if (trust.trustPeriodEnds) {

          drawLabeledLine(page4, {

            label: "Trust Period Ends",

            value: trust.trustPeriodEnds || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        // Trust Period Ends Other details

        if (trust.trustPeriodEndsOther) {

          drawLabeledLine(page4, {

            label: "Trust Period Ends Other",

            value: trust.trustPeriodEndsOther || "",

            x: 50,

            y: y4,

            lineWidth: 200,

            labelWidth: 110,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });

          y4 -= 18;

        }



        y4 -= 20;

      });

    } else {

      drawLabeledLine(page4, {

        label: "Property Trusts",

        value: "None specified",

        x: 50,

        y: y4,

        lineWidth: 200,

        labelWidth: 100,

        dynamicWidth: true,

        minWidth: 100,

        maxWidth: 250,

      });

      y4 -= 30;

    }



    /**

     * RESIDUE SECTION

     * Order: 8. Residue (after Property Trusts)

     */

    if (y4 < 150) {

      page4 = pdfDoc.addPage([width, height]);

      y4 = height - 60;

    }



    y4 = drawSectionHeader(page4, "RESIDUE", y4 + 4);

    y4 -= 10;



    const residue = getSafeValue(formData, "willInstructions.residue", {});



    drawLabeledLine(page4, {

      label: "Spousal Estate Transfer",

      value: residue.spousalEstateTransfer || "",

      x: 50,

      y: y4,

      lineWidth: 300,

      labelWidth: 140,

      dynamicWidth: true,

      minWidth: 150,

      maxWidth: 350,

    });

    y4 -= 25;



    const percentageGroups = residue.percentageGroups || [];

    if (percentageGroups.length > 0) {

      page4.drawText("Percentage Groups:", {

        x: 50,

        y: y4,

        size: 10,

        font: boldFont,

        color: rgb(0, 0, 0),

      });

      y4 -= 18;



      percentageGroups.forEach((group, idx) => {

        drawLabeledLine(page4, {

          label: `Group ${idx + 1} - Percentage`,

          value: group.percentage ? `${group.percentage}%` : "",

          x: 50,

          y: y4,

          lineWidth: 150,

          labelWidth: 140,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 200,

        });

        y4 -= 18;



        // Display type if available

        if (group.type) {

          const typeText =

            group.type === "discretionary_trust"

              ? "Discretionary Trust"

              : group.type === "individual"

                ? "Individual"

                : group.type;

          drawLabeledLine(page4, {

            label: `Group ${idx + 1} - Type`,

            value: typeText,

            x: 50,

            y: y4,

            lineWidth: 150,

            labelWidth: 140,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 200,

          });

          y4 -= 18;

        }



        if (group.beneficiaries && group.beneficiaries.length > 0) {

          // Display each beneficiary with details on separate lines

          page4.drawText("Beneficiaries:", {

            x: 50,

            y: y4,

            size: 11,

            font: boldFont,

            color: rgb(0, 0, 0),

          });

          y4 -= 18;



          group.beneficiaries.forEach((beneficiary, bIndex) => {

            if (y4 < 120) {

              page4 = pdfDoc.addPage([width, height]);

              y4 = height - 60;

            }



            // Beneficiary name with number and title

            let beneficiaryText = `${bIndex + 1}. `;

            if (beneficiary.title) beneficiaryText += `${beneficiary.title} `;

            if (beneficiary.name) beneficiaryText += beneficiary.name;



            page4.drawText(beneficiaryText, {

              x: 55,

              y: y4,

              size: 10,

              font: boldFont,

              color: rgb(0, 0, 0),

            });

            y4 -= 14;



            // Relationship field

            if (beneficiary.relationship) {

              page4.drawText(`Relationship:`, {

                x: 65,

                y: y4,

                size: 9,

                font: boldFont,

                color: rgb(0.2, 0.2, 0.2),

              });

              page4.drawText(beneficiary.relationship, {

                x: 140,

                y: y4,

                size: 9,

                font,

                color: rgb(0, 0, 0),

              });

              y4 -= 12;

            }



            // Class gift/named group field

            if (beneficiary.classGift) {

              page4.drawText(`Class gift/named group:`, {

                x: 65,

                y: y4,

                size: 9,

                font: boldFont,

                color: rgb(0.2, 0.2, 0.2),

              });

              page4.drawText(beneficiary.classGift, {

                x: 200,

                y: y4,

                size: 9,

                font,

                color: rgb(0, 0, 0),

              });

              y4 -= 12;

            }



            // Address field

            if (beneficiary.address) {

              page4.drawText(`Address:`, {

                x: 65,

                y: y4,

                size: 9,

                font: boldFont,

                color: rgb(0.2, 0.2, 0.2),

              });

              // Handle multi-line address

              const addressLines = beneficiary.address.split("\n");

              addressLines.forEach((line, lineIndex) => {

                if (line.trim()) {

                  page4.drawText(line.trim(), {

                    x: 200,

                    y: y4 - lineIndex * 12,

                    size: 9,

                    font,

                    color: rgb(0, 0, 0),

                  });

                }

              });

              y4 -= addressLines.length * 12 + 6;

            }



            // Age of Vesting field

            if (beneficiary.ageOfVesting) {

              page4.drawText(`Age of Vesting (if under 18):`, {

                x: 65,

                y: y4,

                size: 9,

                font: boldFont,

                color: rgb(0.2, 0.2, 0.2),

              });

              page4.drawText(beneficiary.ageOfVesting, {

                x: 200,

                y: y4,

                size: 9,

                font,

                color: rgb(0, 0, 0),

              });

              y4 -= 12;

            }



            y4 -= 8; // Extra space between beneficiaries

          });



          y4 -= 10;

        }

        y4 -= 10;

      });

    }



    drawYesNoRow(page4, {

      label: "Has Substitutional Provisions",

      value: residue.hasSubstitutionalProvisions || false,

      x: 50,

      y: y4,

    });

    y4 -= 25;



    const alternateGroups = residue.alternateGroups || [];

    if (alternateGroups.length > 0) {

      // Check if we need a new page before alternate groups

      if (y4 < 150) {

        page4 = pdfDoc.addPage([width, height]);

        y4 = height - 60;

      }



      page4.drawText("Alternate Groups:", {

        x: 50,

        y: y4,

        size: 10,

        font: boldFont,

        color: rgb(0, 0, 0),

      });

      y4 -= 18;



      alternateGroups.forEach((group, idx) => {

        // Check if we need a new page before each alternate group

        if (y4 < 120) {

          page4 = pdfDoc.addPage([width, height]);

          y4 = height - 60;

        }

        drawLabeledLine(page4, {

          label: `Alternate Group ${idx + 1}`,

          value: group.description || "",

          x: 50,

          y: y4,

          lineWidth: 400,

          labelWidth: 120,

          shouldWrapText: true,

          lineHeight: 12,

          dynamicWidth: true,

          minWidth: 200,

          maxWidth: 450,

        });

        y4 -= 30;



        // Display type if available

        if (group.type) {

          const typeText =

            group.type === "discretionary_trust"

              ? "Discretionary Trust"

              : group.type === "individual"

                ? "Individual"

                : group.type;

          drawLabeledLine(page4, {

            label: `Alternate Group ${idx + 1} - Type`,

            value: typeText,

            x: 50,

            y: y4,

            lineWidth: 150,

            labelWidth: 140,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 200,

          });

          y4 -= 18;

        }

      });

    }



    y4 -= 20;



    /**

     * BUSINESS TRUST SECTION

     * Order: 9. Business Trust (after Residue)

     */

    if (y4 < 150) {

      page4 = pdfDoc.addPage([width, height]);

      y4 = height - 60;

    }



    y4 = drawSectionHeader(page4, "BUSINESS TRUST", y4 + 4);

    y4 -= 10;



    const businessTrusts = getSafeValue(

      formData,

      "willInstructions.businessTrusts",

      [],

    );



    if (Array.isArray(businessTrusts) && businessTrusts.length > 0) {

      businessTrusts.forEach((trust, idx) => {

        if (y4 < 250) {

          page4 = pdfDoc.addPage([width, height]);

          y4 = height - 60;

        }



        page4.drawText(`Business Trust ${idx + 1}`, {

          x: 50,

          y: y4,

          size: 11,

          font: boldFont,

          color: rgb(0, 0, 0),

        });

        y4 -= 18;



        drawLabeledLine(page4, {

          label: "Business Name",

          value: trust.businessName || "",

          x: 50,

          y: y4,

          lineWidth: 300,

          labelWidth: 90,

          dynamicWidth: true,

          minWidth: 150,

          maxWidth: 350,

        });

        y4 -= 18;



        drawLabeledLine(page4, {

          label: "Business Type",

          value: trust.businessType || "",

          x: 50,

          y: y4,

          lineWidth: 300,

          labelWidth: 90,

          dynamicWidth: true,

          minWidth: 150,

          maxWidth: 350,

        });

        y4 -= 18;



        // Ownership Details Box

        const ownershipDetails = trust.ownershipDetails || "";



        page4.drawText("Ownership Details", {

          x: 50,

          y: y4,

          size: 11,

          font: boldFont,

          color: rgb(0, 0, 0),

        });



        y4 -= 25;



        // Calculate dynamic height for Ownership Details box

        const minBoxHeightOD = 50;

        const lineHeightOD = 12;

        const maxWidthOD = width - 110;



        // Calculate text height for Ownership Details

        let textHeightOD = 0;

        if (ownershipDetails) {

          const words = ownershipDetails.split(" ");

          let currentLine = "";

          let lines = [];



          for (const word of words) {

            const testLine = currentLine ? `${currentLine} ${word}` : word;

            const testWidth = font.widthOfTextAtSize(testLine, 9);



            if (testWidth <= maxWidthOD) {

              currentLine = testLine;

            } else {

              if (currentLine) lines.push(currentLine);

              currentLine = word;

            }

          }

          if (currentLine) lines.push(currentLine);



          textHeightOD = lines.length * lineHeightOD;

        }



        const boxHeightOD = Math.max(minBoxHeightOD, textHeightOD + 25);

        const boxYOD = y4 - boxHeightOD + 20;



        page4.drawRectangle({

          x: 45,

          y: boxYOD,

          width: width - 90,

          height: boxHeightOD,

          color: rgb(0.96, 0.96, 0.96),

          borderWidth: 0.5,

          borderColor: rgb(0.85, 0.85, 0.85),

        });



        if (ownershipDetails) {

          page4.drawText(ownershipDetails, {

            x: 52,

            y: boxYOD + boxHeightOD - 26,

            size: 9,

            font,

            color: rgb(0, 0, 0),

            maxWidth: width - 110,

            lineHeight: 12,

          });

        }



        y4 = boxYOD - 20;



        if (trust.beneficiaries && trust.beneficiaries.length > 0) {

          // Display each beneficiary with details on separate lines

          page4.drawText("Beneficiaries:", {

            x: 50,

            y: y4,

            size: 11,

            font: boldFont,

            color: rgb(0, 0, 0),

          });

          y4 -= 18;



          trust.beneficiaries.forEach((beneficiary, bIndex) => {

            if (y4 < 120) {

              page4 = pdfDoc.addPage([width, height]);

              y4 = height - 60;

            }



            // Beneficiary name with number

            let beneficiaryText = `${bIndex + 1}. `;

            if (beneficiary.name) beneficiaryText += beneficiary.name;



            page4.drawText(beneficiaryText, {

              x: 55,

              y: y4,

              size: 10,

              font: boldFont,

              color: rgb(0, 0, 0),

            });

            y4 -= 14;



            // Relationship field

            if (beneficiary.relationship) {

              page4.drawText(`Relationship:`, {

                x: 65,

                y: y4,

                size: 9,

                font: boldFont,

                color: rgb(0.2, 0.2, 0.2),

              });

              page4.drawText(beneficiary.relationship, {

                x: 140,

                y: y4,

                size: 9,

                font,

                color: rgb(0, 0, 0),

              });

              y4 -= 12;

            }



            // Class gift/named group field

            if (beneficiary.classGift) {

              page4.drawText(`Class gift/named group:`, {

                x: 65,

                y: y4,

                size: 9,

                font: boldFont,

                color: rgb(0.2, 0.2, 0.2),

              });

              page4.drawText(beneficiary.classGift, {

                x: 200,

                y: y4,

                size: 9,

                font,

                color: rgb(0, 0, 0),

              });

              y4 -= 12;

            }



            // Address field

            if (beneficiary.address) {

              page4.drawText(`Address:`, {

                x: 65,

                y: y4,

                size: 9,

                font: boldFont,

                color: rgb(0.2, 0.2, 0.2),

              });

              // Handle multi-line address

              const addressLines = beneficiary.address.split("\n");

              addressLines.forEach((line, lineIndex) => {

                if (line.trim()) {

                  page4.drawText(line.trim(), {

                    x: 200,

                    y: y4 - lineIndex * 12,

                    size: 9,

                    font,

                    color: rgb(0, 0, 0),

                  });

                }

              });

              y4 -= addressLines.length * 12 + 6;

            }



            // Age of Vesting field

            if (beneficiary.ageOfVesting) {

              page4.drawText(`Age of Vesting (if under 18):`, {

                x: 65,

                y: y4,

                size: 9,

                font: boldFont,

                color: rgb(0.2, 0.2, 0.2),

              });

              page4.drawText(beneficiary.ageOfVesting, {

                x: 200,

                y: y4,

                size: 9,

                font,

                color: rgb(0, 0, 0),

              });

              y4 -= 12;

            }



            y4 -= 8; // Extra space between beneficiaries

          });



          y4 -= 10;

        }



        // Trust Terms Box

        const trustTermsText = trust.trustTerms || "";



        page4.drawText("Trust Terms", {

          x: 50,

          y: y4,

          size: 11,

          font: boldFont,

          color: rgb(0, 0, 0),

        });



        y4 -= 25;



        // Calculate dynamic height for Trust Terms box

        const minBoxHeightTT = 50;

        const lineHeightTT = 12;

        const maxWidthTT = width - 110;



        // Calculate text height for Trust Terms

        let textHeightTT = 0;

        if (trustTermsText) {

          const words = trustTermsText.split(" ");

          let currentLine = "";

          let lines = [];



          for (const word of words) {

            const testLine = currentLine ? `${currentLine} ${word}` : word;

            const testWidth = font.widthOfTextAtSize(testLine, 9);



            if (testWidth <= maxWidthTT) {

              currentLine = testLine;

            } else {

              if (currentLine) lines.push(currentLine);

              currentLine = word;

            }

          }

          if (currentLine) lines.push(currentLine);



          textHeightTT = lines.length * lineHeightTT;

        }



        const boxHeightTT = Math.max(minBoxHeightTT, textHeightTT + 25);

        const boxYTT = y4 - boxHeightTT + 20;



        page4.drawRectangle({

          x: 45,

          y: boxYTT,

          width: width - 90,

          height: boxHeightTT,

          color: rgb(0.96, 0.96, 0.96),

          borderWidth: 0.5,

          borderColor: rgb(0.85, 0.85, 0.85),

        });



        if (trustTermsText) {

          page4.drawText(trustTermsText, {

            x: 52,

            y: boxYTT + boxHeightTT - 26,

            size: 9,

            font,

            color: rgb(0, 0, 0),

            maxWidth: width - 110,

            lineHeight: 12,

          });

        }



        y4 = boxYTT - 20;



        y4 -= 20;

      });

    } else {

      drawLabeledLine(page4, {

        label: "Business Trusts",

        value: "None specified",

        x: 50,

        y: y4,

        lineWidth: 200,

        labelWidth: 100,

        dynamicWidth: true,

        minWidth: 100,

        maxWidth: 250,

      });

      y4 -= 30;

    }



    /**

     * TESTAMENTARY CAPACITY SECTION

     * Order: 10. Testamentary Capacity (after Business Trust)

     */

    if (y4 < 150) {

      page4 = pdfDoc.addPage([width, height]);

      y4 = height - 60;

    }



    y4 = drawSectionHeader(page4, "TESTAMENTARY CAPACITY", y4 + 4);

    y4 -= 10;



    const testamentaryCapacity = getSafeValue(

      formData,

      "willInstructions.testamentaryCapacity",

      {},

    );



    drawYesNoRow(page4, {

      label: "Has LPAs",

      value:

        testamentaryCapacity.hasLPAs === "yes" ||

        testamentaryCapacity.hasLPAs === true,

      x: 50,

      y: y4,

    });

    y4 -= 25;



    drawYesNoRow(page4, {

      label: "Has Concerns",

      value:

        testamentaryCapacity.hasConcerns === "yes" ||

        testamentaryCapacity.hasConcerns === true,

      x: 50,

      y: y4,

    });

    y4 -= 25;



    drawYesNoRow(page4, {

      label: "Understands Instructions",

      value:

        testamentaryCapacity.understandsInstructions === "yes" ||

        testamentaryCapacity.understandsInstructions === true,

      x: 50,

      y: y4,

    });

    y4 -= 25;



    drawYesNoRow(page4, {

      label: "Understands Claims",

      value:

        testamentaryCapacity.understandsClaims === "yes" ||

        testamentaryCapacity.understandsClaims === true,

      x: 50,

      y: y4,

    });

    y4 -= 25;



    drawYesNoRow(page4, {

      label: "Not Unduly Influenced",

      value:

        testamentaryCapacity.notUndulyInfluenced === "yes" ||

        testamentaryCapacity.notUndulyInfluenced === true,

      x: 50,

      y: y4,

    });

    y4 -= 25;



    drawYesNoRow(page4, {

      label: "Paralegal Certification",

      value: testamentaryCapacity.paralegalCertification || false,

      x: 50,

      y: y4,

    });

    y4 -= 40;



    /**

     * ADDITIONAL INSTRUCTIONS SECTION

     * Order: 11. Additional Instructions (after Testamentary Capacity)

     */

    if (y4 < 150) {

      page4 = pdfDoc.addPage([width, height]);

      y4 = height - 60;

    }



    const extraInstructions = getSafeValue(

      formData,

      "willInstructions.additionalInstructions",

      "",

    );



    page4.drawText("Additional Instructions", {

      x: 50,

      y: y4,

      size: 12,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    y4 -= 28;



    // Calculate dynamic height for Additional Instructions box

    const minBoxHeightAI = 70;

    const lineHeightAI = 12;

    const maxWidthAI = width - 110;



    // Calculate text height

    let textHeightAI = 0;

    if (extraInstructions) {

      const words = extraInstructions.split(" ");

      let currentLine = "";

      let lines = [];



      for (const word of words) {

        const testLine = currentLine ? `${currentLine} ${word}` : word;

        const testWidth = font.widthOfTextAtSize(testLine, 9);



        if (testWidth <= maxWidthAI) {

          currentLine = testLine;

        } else {

          if (currentLine) lines.push(currentLine);

          currentLine = word;

        }

      }

      if (currentLine) lines.push(currentLine);



      textHeightAI = lines.length * lineHeightAI;

    }



    const boxHeightAI = Math.max(minBoxHeightAI, textHeightAI + 30);

    const boxYAI = y4 - boxHeightAI + 20;



    page4.drawRectangle({

      x: 45,

      y: boxYAI,

      width: width - 90,

      height: boxHeightAI,

      color: rgb(0.96, 0.96, 0.96),

      borderWidth: 0.5,

      borderColor: rgb(0.85, 0.85, 0.85),

    });



    if (extraInstructions) {

      page4.drawText(extraInstructions, {

        x: 52,

        y: boxYAI + boxHeightAI - 26,

        size: 9,

        font,

        color: rgb(0, 0, 0),

        maxWidth: width - 110,

        lineHeight: 12,

      });

    }



    y4 = boxYAI - 40;



    /**

     * LPA INSTRUCTIONS PAGE

     * Order: 12. LPA Instructions (after Additional Instructions)

     */

    let pageLPA = pdfDoc.addPage([width, height]);

    let yLPA = height - 60;



    const lpa = processedData.lpaInstructions || {};



    // Draw section header

    yLPA = drawSectionHeader(pageLPA, "LPA INSTRUCTIONS", yLPA + 4);

    yLPA -= 10; // Space after header



    drawYesNoRow(pageLPA, {

      label: "Are LPAs required?",

      value: lpa.requireLPAs,

      x: 50,

      y: yLPA,

    });



    yLPA -= 28;



    // Add the new question about nominating each other as attorney

    if (lpa.requireLPAs === "yes") {

      drawYesNoRow(pageLPA, {

        label: "Are the clients nominating each other as attorney?",

        value: lpa.nominatingEachOtherAsAttorney,

        x: 50,

        y: yLPA,

      });



      yLPA -= 28;

    }



    const lpaC1 = lpa.client1 || {};



    pageLPA.drawText("Client 1 LPA", {

      x: 50,

      y: yLPA,

      size: 12,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    yLPA -= 18;



    // Preferences / Instructions Box for Client 1

    const preferencesC1 = lpaC1.preferences || "";



    pageLPA.drawText("Preferences / Instructions", {

      x: 50,

      y: yLPA,

      size: 11,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    yLPA -= 25;



    // Calculate dynamic height for Preferences box

    const minBoxHeightPrefC1 = 50;

    const lineHeightPrefC1 = 12;

    const maxWidthPrefC1 = width - 110;



    // Calculate text height for Preferences

    let textHeightPrefC1 = 0;

    if (preferencesC1) {

      const words = preferencesC1.split(" ");

      let currentLine = "";

      let lines = [];



      for (const word of words) {

        const testLine = currentLine ? `${currentLine} ${word}` : word;

        const testWidth = font.widthOfTextAtSize(testLine, 9);



        if (testWidth <= maxWidthPrefC1) {

          currentLine = testLine;

        } else {

          if (currentLine) lines.push(currentLine);

          currentLine = word;

        }

      }

      if (currentLine) lines.push(currentLine);



      textHeightPrefC1 = lines.length * lineHeightPrefC1;

    }



    const boxHeightPrefC1 = Math.max(minBoxHeightPrefC1, textHeightPrefC1 + 25);

    const boxYPrefC1 = yLPA - boxHeightPrefC1 + 20;



    pageLPA.drawRectangle({

      x: 45,

      y: boxYPrefC1,

      width: width - 90,

      height: boxHeightPrefC1,

      color: rgb(0.96, 0.96, 0.96),

      borderWidth: 0.5,

      borderColor: rgb(0.85, 0.85, 0.85),

    });



    if (preferencesC1) {

      pageLPA.drawText(preferencesC1, {

        x: 52,

        y: boxYPrefC1 + boxHeightPrefC1 - 26,

        size: 9,

        font,

        color: rgb(0, 0, 0),

        maxWidth: width - 110,

        lineHeight: 12,

      });

    }



    yLPA = boxYPrefC1 - 20;



    drawLabeledLine(pageLPA, {

      label: "Certificate provider",

      value: lpaC1.certificateProvider,

      x: 50,

      y: yLPA,

      lineWidth: 220,

      labelWidth: 130,

      dynamicWidth: true,

      minWidth: 150,

      maxWidth: 250,

    });



    yLPA -= 18;



    drawLabeledLine(pageLPA, {

      label: "Decision timing",

      value: lpaC1.decisionTiming,

      x: 50,

      y: yLPA,

      lineWidth: 220,

      labelWidth: 115,

      dynamicWidth: true,

      minWidth: 150,

      maxWidth: 250,

    });



    yLPA -= 18;



    drawLabeledLine(pageLPA, {

      label: "Store or register",

      value: lpaC1.storeOrRegister,

      x: 50,

      y: yLPA,

      lineWidth: 220,

      labelWidth: 115,

      dynamicWidth: true,

      minWidth: 150,

      maxWidth: 250,

    });



    yLPA -= 18; // Reduced from 18



    drawYesNoRow(pageLPA, {

      label: "Client 1 aware of registration fee?",

      value: lpaC1.awareOfFee,

      x: 50,

      y: yLPA,

    });



    yLPA -= 30;



    // Property Attorneys Section for Client 1

    if (lpaC1.propertyAttorneys && lpaC1.propertyAttorneys.length > 0) {

      pageLPA.drawText("Client 1 Property Attorneys", {

        x: 50,

        y: yLPA,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      yLPA -= 18;



      lpaC1.propertyAttorneys.forEach((attorney, idx) => {

        // Property attorney fields in proper format

        drawLabeledLine(pageLPA, {

          label: `Title`,

          value: getSafeValue(attorney, "title", ""),

          x: 50,

          y: yLPA,

          lineWidth: 80,

          labelWidth: 60,

          dynamicWidth: true,

          minWidth: 50,

          maxWidth: 100,

        });



        yLPA -= 16;



        drawLabeledLine(pageLPA, {

          label: `Name`,

          value: getSafeValue(attorney, "name", ""),

          x: 50,

          y: yLPA,

          lineWidth: 200,

          labelWidth: 60,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 250,

        });



        yLPA -= 16;



        drawLabeledLine(pageLPA, {

          label: `DOB`,

          value: getSafeValue(attorney, "dob", ""),

          x: 50,

          y: yLPA,

          lineWidth: 120,

          labelWidth: 60,

          dynamicWidth: true,

          minWidth: 80,

          maxWidth: 150,

        });



        yLPA -= 16;



        drawLabeledLine(pageLPA, {

          label: `Address`,

          value: getSafeValue(attorney, "address", ""),

          x: 50,

          y: yLPA,

          lineWidth: width - 150,

          labelWidth: 70,

          dynamicWidth: true,

          minWidth: 150,

          maxWidth: width - 150,

        });



        yLPA -= 20;

      });



      yLPA -= 20;

    }



    // Health Attorneys Section for Client 1

    if (lpaC1.healthAttorneys && lpaC1.healthAttorneys.length > 0) {

      pageLPA.drawText("Client 1 Health Attorneys", {

        x: 50,

        y: yLPA,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      yLPA -= 18;



      lpaC1.healthAttorneys.forEach((attorney, idx) => {

        // Check if we need a new page before drawing this attorney

        if (yLPA < 150) {

          pageLPA = pdfDoc.addPage([width, height]);

          yLPA = height - 60;



          // Redraw section header on new page

          pageLPA.drawText("Client 1 Health Attorneys (continued)", {

            x: 50,

            y: yLPA,

            size: 12,

            font: boldFont,

            color: rgb(0, 0, 0),

          });

          yLPA -= 18;

        }



        // Health attorney fields in proper format

        drawLabeledLine(pageLPA, {

          label: `Title`,

          value: getSafeValue(attorney, "title", ""),

          x: 50,

          y: yLPA,

          lineWidth: 80,

          labelWidth: 60,

          dynamicWidth: true,

          minWidth: 50,

          maxWidth: 100,

        });



        yLPA -= 16;



        drawLabeledLine(pageLPA, {

          label: `Name`,

          value: getSafeValue(attorney, "name", ""),

          x: 50,

          y: yLPA,

          lineWidth: 200,

          labelWidth: 60,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 250,

        });



        yLPA -= 16;



        drawLabeledLine(pageLPA, {

          label: ` DOB`,

          value: getSafeValue(attorney, "dob", ""),

          x: 50,

          y: yLPA,

          lineWidth: 120,

          labelWidth: 60,

          dynamicWidth: true,

          minWidth: 80,

          maxWidth: 150,

        });



        yLPA -= 16;



        drawLabeledLine(pageLPA, {

          label: ` Address`,

          value: getSafeValue(attorney, "address", ""),

          x: 50,

          y: yLPA,

          lineWidth: width - 150,

          labelWidth: 70,

          dynamicWidth: true,

          minWidth: 150,

          maxWidth: width - 150,

        });



        yLPA -= 20;

      });



      yLPA -= 20;

    }



    // People to Notify Section for Client 1

    if (lpaC1.peopleToNotify && lpaC1.peopleToNotify.length > 0) {

      pageLPA.drawText("Client 1 People to Notify", {

        x: 50,

        y: yLPA,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      yLPA -= 18;



      lpaC1.peopleToNotify.forEach((person, idx) => {

        const personText = `${idx + 1}. ${getSafeValue(

          person,

          "name",

          "",

        )} (${getSafeValue(person, "address", "")})`;

        pageLPA.drawText(personText, {

          x: 65,

          y: yLPA,

          size: 9,

          font,

          color: rgb(0, 0, 0),

          maxWidth: width - 110,

        });

        yLPA -= 14;

      });



      yLPA -= 20;

    }



    // Client 2 LPA Section

    const lpaC2 = lpa.client2 || {};



    if (

      lpaC2.preferences ||

      lpaC2.certificateProvider ||

      lpaC2.decisionTiming ||

      lpaC2.storeOrRegister

    ) {

      pageLPA.drawText("Client 2 LPA", {

        x: 50,

        y: yLPA,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      yLPA -= 18;



      // Preferences / Instructions Box for Client 2

      const preferencesC2 = lpaC2.preferences || "";



      pageLPA.drawText("Preferences / Instructions", {

        x: 50,

        y: yLPA,

        size: 11,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      yLPA -= 25;



      // Calculate dynamic height for Preferences box

      const minBoxHeightPrefC2 = 50;

      const lineHeightPrefC2 = 12;

      const maxWidthPrefC2 = width - 110;



      // Calculate text height for Preferences

      let textHeightPrefC2 = 0;

      if (preferencesC2) {

        const words = preferencesC2.split(" ");

        let currentLine = "";

        let lines = [];



        for (const word of words) {

          const testLine = currentLine ? `${currentLine} ${word}` : word;

          const testWidth = font.widthOfTextAtSize(testLine, 9);



          if (testWidth <= maxWidthPrefC2) {

            currentLine = testLine;

          } else {

            if (currentLine) lines.push(currentLine);

            currentLine = word;

          }

        }

        if (currentLine) lines.push(currentLine);



        textHeightPrefC2 = lines.length * lineHeightPrefC2;

      }



      const boxHeightPrefC2 = Math.max(

        minBoxHeightPrefC2,

        textHeightPrefC2 + 25,

      );

      const boxYPrefC2 = yLPA - boxHeightPrefC2 + 20;



      pageLPA.drawRectangle({

        x: 45,

        y: boxYPrefC2,

        width: width - 90,

        height: boxHeightPrefC2,

        color: rgb(0.96, 0.96, 0.96),

        borderWidth: 0.5,

        borderColor: rgb(0.85, 0.85, 0.85),

      });



      if (preferencesC2) {

        pageLPA.drawText(preferencesC2, {

          x: 52,

          y: boxYPrefC2 + boxHeightPrefC2 - 26,

          size: 9,

          font,

          color: rgb(0, 0, 0),

          maxWidth: width - 110,

          lineHeight: 12,

        });

      }



      yLPA = boxYPrefC2 - 20;



      drawLabeledLine(pageLPA, {

        label: "Certificate provider",

        value: lpaC2.certificateProvider,

        x: 50,

        y: yLPA,

        lineWidth: 220,

        labelWidth: 130,

        dynamicWidth: true,

        minWidth: 150,

        maxWidth: 250,

      });



      yLPA -= 18;



      drawLabeledLine(pageLPA, {

        label: "Decision timing",

        value: lpaC2.decisionTiming,

        x: 50,

        y: yLPA,

        lineWidth: 220,

        labelWidth: 115,

        dynamicWidth: true,

        minWidth: 150,

        maxWidth: 250,

      });



      yLPA -= 18;



      drawLabeledLine(pageLPA, {

        label: "Store or register",

        value: lpaC2.storeOrRegister,

        x: 50,

        y: yLPA,

        lineWidth: 220,

        labelWidth: 115,

        dynamicWidth: true,

        minWidth: 150,

        maxWidth: 250,

      });



      yLPA -= 18;



      drawYesNoRow(pageLPA, {

        label: "Client 2 aware of registration fee?",

        value: lpaC2.awareOfFee,

        x: 50,

        y: yLPA,

      });



      yLPA -= 30;



      // Property Attorneys Section for Client 2

      if (lpaC2.propertyAttorneys && lpaC2.propertyAttorneys.length > 0) {

        pageLPA.drawText("Client 2 Property Attorneys", {

          x: 50,

          y: yLPA,

          size: 12,

          font: boldFont,

          color: rgb(0, 0, 0),

        });



        yLPA -= 18;



        lpaC2.propertyAttorneys.forEach((attorney, idx) => {

          // Property attorney fields in proper format

          drawLabeledLine(pageLPA, {

            label: `Title`,

            value: getSafeValue(attorney, "title", ""),

            x: 50,

            y: yLPA,

            lineWidth: 80,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 50,

            maxWidth: 100,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Name`,

            value: getSafeValue(attorney, "name", ""),

            x: 50,

            y: yLPA,

            lineWidth: 200,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `DOB`,

            value: getSafeValue(attorney, "dob", ""),

            x: 50,

            y: yLPA,

            lineWidth: 120,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 80,

            maxWidth: 150,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Address`,

            value: getSafeValue(attorney, "address", ""),

            x: 50,

            y: yLPA,

            lineWidth: width - 150,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 150,

            maxWidth: width - 150,

          });



          yLPA -= 20;

        });



        yLPA -= 20;

      }



      // Health Attorneys Section for Client 2

      if (lpaC2.healthAttorneys && lpaC2.healthAttorneys.length > 0) {

        pageLPA.drawText("Client 2 Health Attorneys", {

          x: 50,

          y: yLPA,

          size: 12,

          font: boldFont,

          color: rgb(0, 0, 0),

        });



        yLPA -= 18;



        lpaC2.healthAttorneys.forEach((attorney, idx) => {

          // Check if we need a new page before drawing this attorney (more aggressive check)

          if (yLPA < 200) {

            // Increased threshold from 150 to 200

            pageLPA = pdfDoc.addPage([width, height]);

            yLPA = height - 60;



            // Redraw section header on new page

            pageLPA.drawText("", {

              x: 50,

              y: yLPA,

              size: 12,

              font: boldFont,

              color: rgb(0, 0, 0),

            });

            yLPA -= 18;

          }



          // Health attorney fields in proper format

          drawLabeledLine(pageLPA, {

            label: `Title`,

            value: getSafeValue(attorney, "title", ""),

            x: 50,

            y: yLPA,

            lineWidth: 80,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 50,

            maxWidth: 100,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Name`,

            value: getSafeValue(attorney, "name", ""),

            x: 50,

            y: yLPA,

            lineWidth: 200,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `$DOB`,

            value: getSafeValue(attorney, "dob", ""),

            x: 50,

            y: yLPA,

            lineWidth: 120,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 80,

            maxWidth: 150,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Address`,

            value: getSafeValue(attorney, "address", ""),

            x: 50,

            y: yLPA,

            lineWidth: width - 150,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 150,

            maxWidth: width - 150,

          });



          // Calculate how much space the address actually took

          const addressLines = attorney.address

            ? wrapText(attorney.address, font, width - 150, 12).length

            : 1;

          yLPA -= 20 + (addressLines > 1 ? (addressLines - 1) * 12 : 0);



          // Check if we need a new page after the address field

          if (yLPA < 180) {

            pageLPA = pdfDoc.addPage([width, height]);

            yLPA = height - 30;



            // Redraw section header on new page

            pageLPA.drawText("Client 2 Health Attorneys (continued)", {

              x: 50,

              y: yLPA,

              size: 12,

              font: boldFont,

              color: rgb(0, 0, 0),

            });

            yLPA -= 18;

          }

        });



        yLPA -= 20;

      }



      // People to Notify Section for Client 2

      if (lpaC2.peopleToNotify && lpaC2.peopleToNotify.length > 0) {

        pageLPA.drawText("Client 2 People to Notify", {

          x: 50,

          y: yLPA,

          size: 12,

          font: boldFont,

          color: rgb(0, 0, 0),

        });



        yLPA -= 18;



        lpaC2.peopleToNotify.forEach((person, idx) => {

          const personText = `${idx + 1}. ${getSafeValue(

            person,

            "name",

            "",

          )} (${getSafeValue(person, "address", "")})`;

          pageLPA.drawText(personText, {

            x: 65,

            y: yLPA,

            size: 9,

            font,

            color: rgb(0, 0, 0),

            maxWidth: width - 110,

          });

          yLPA -= 14;

        });



        yLPA -= 5;

      }

    }



    // Add minimal space after last LPA item

    yLPA -= 5;



    /**

     * FAMILY PROTECTION TRUST INSTRUCTIONS SECTION

     * Order: 13. Family Protection Trust Instructions (after LPA Instructions)

     * Continue on the same page as Client 2 health attorneys

     */



    // Draw section header for Family Protection on the same page

    yLPA = drawSectionHeader(pageLPA, "FAMILY PROTECTION", yLPA + 4);

    yLPA -= 10; // Space after header



    const fp = processedData.familyProtection || {};



    drawYesNoRow(pageLPA, {

      label: "Is a Family Protection Trust required?",

      value: fp.requireTrust,

      x: 50,

      y: yLPA,

    });



    yLPA -= 20;



    drawLabeledLine(pageLPA, {

      label: "Client 1 NI",

      value: fp.client1NI,

      x: 50,

      y: yLPA,

      labelWidth: 70,

      shouldWrapText: true,

      dynamicWidth: true,

      minWidth: 100,

      maxWidth: 180,

      lineHeight: 12,

    });



    // Calculate how much space Client 1 NI actually took

    const client1NILines = fp.client1NI

      ? wrapText(fp.client1NI, font, 160, 12).length

      : 1;



    // Move to next row for Client 2

    const client2Y =

      yLPA - (client1NILines > 1 ? (client1NILines - 1) * 14 + 20 : 20);



    drawLabeledLine(pageLPA, {

      label: "Client 2 NI",

      value: fp.client2NI,

      x: 50,

      y: client2Y,

      labelWidth: 70,

      shouldWrapText: true,

      dynamicWidth: true,

      minWidth: 100,

      maxWidth: 180,

      lineHeight: 12,

    });



    // Calculate how much space Client 2 NI actually took for proper yLPA adjustment

    const client2NILines = fp.client2NI

      ? wrapText(fp.client2NI, font, 160, 12).length

      : 1;



    // Adjust yLPA based on the maximum number of lines used by either field

    const maxLines = Math.max(client1NILines, client2NILines);

    yLPA = client2Y - (maxLines - 1) * 14 - 20;



    drawYesNoRow(pageLPA, {

      label: "Clients acting as Trustees?",

      value: fp.clientsAsTrustees,

      x: 50,

      y: yLPA,

    });



    yLPA -= 28;



    const settlors = fp.settlors || {};



    drawYesNoRow(pageLPA, {

      label: "Settlor – Client 1",

      value: settlors.client1,

      x: 50,

      y: yLPA,

    });



    yLPA -= 20;



    drawYesNoRow(pageLPA, {

      label: "Settlor – Client 2",

      value: settlors.client2,

      x: 50,

      y: yLPA,

    });



    yLPA -= 20;



    drawYesNoRow(pageLPA, {

      label: "Settlor – Both",

      value: settlors.both,

      x: 50,

      y: yLPA,

    });



    yLPA -= 32;



    // Trustees Section

    const client1Trustees = fp.client1Trustees || [];

    const client2Trustees = fp.client2Trustees || [];



    if (client1Trustees.length > 0 || client2Trustees.length > 0) {

      pageLPA.drawText("Trustees", {

        x: 50,

        y: yLPA,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      yLPA -= 12;



      // Client 1 Trustees

      if (client1Trustees.length > 0) {

        // Check if we need a new page before drawing Client 1 Trustees header

        if (yLPA < 180) {

          pageLPA = pdfDoc.addPage([width, height]);

          yLPA = height - 60;

        }



        pageLPA.drawText("Client 1 Trustees", {

          x: 50,

          y: yLPA,

          size: 10,

          font: boldFont,

          color: rgb(0, 0, 0),

        });



        yLPA -= 16;



        client1Trustees.forEach((trustee, idx) => {

          // Check if we need a new page before drawing this trustee

          if (yLPA < 120) {

            pageLPA = pdfDoc.addPage([width, height]);

            yLPA = height - 60;

          }



          drawLabeledLine(pageLPA, {

            label: `Title`,

            value: getSafeValue(trustee, "title", ""),

            x: 50,

            y: yLPA,

            lineWidth: 80,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 50,

            maxWidth: 100,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Full Name`,

            value: getSafeValue(trustee, "fullName", ""),

            x: 50,

            y: yLPA,

            lineWidth: 200,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Relationship`,

            value: getSafeValue(trustee, "relationship", ""),

            x: 50,

            y: yLPA,

            lineWidth: 150,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 80,

            maxWidth: 200,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Address`,

            value: getSafeValue(trustee, "address", ""),

            x: 50,

            y: yLPA,

            lineWidth: width - 150,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 150,

            maxWidth: width - 150,

            shouldWrapText: true,

            lineHeight: 12,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `ID Supplied`,

            value: getSafeValue(trustee, "idSupplied", false) ? "Yes" : "No",

            x: 50,

            y: yLPA,

            lineWidth: 80,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 50,

            maxWidth: 100,

          });



          yLPA -= 16;



          // Only show email if ID is not supplied

          if (!getSafeValue(trustee, "idSupplied", false)) {

            drawLabeledLine(pageLPA, {

              label: `Email Address`,

              value: getSafeValue(trustee, "email", ""),

              x: 50,

              y: yLPA,

              lineWidth: 200,

              labelWidth: 70,

              dynamicWidth: true,

              minWidth: 100,

              maxWidth: 250,

            });



            yLPA -= 16;

          }



          yLPA -= 4;

        });



        yLPA -= 10;

      }



      // Client 2 Trustees

      if (client2Trustees.length > 0) {

        // Check if we need a new page before drawing Client 2 Trustees header

        if (yLPA < 180) {

          pageLPA = pdfDoc.addPage([width, height]);

          yLPA = height - 60;

        }



        pageLPA.drawText("Client 2 Trustees", {

          x: 50,

          y: yLPA,

          size: 10,

          font: boldFont,

          color: rgb(0, 0, 0),

        });



        yLPA -= 16;



        client2Trustees.forEach((trustee, idx) => {

          // Check if we need a new page before drawing this trustee

          if (yLPA < 120) {

            pageLPA = pdfDoc.addPage([width, height]);

            yLPA = height - 60;

          }



          drawLabeledLine(pageLPA, {

            label: `Title`,

            value: getSafeValue(trustee, "title", ""),

            x: 50,

            y: yLPA,

            lineWidth: 80,

            labelWidth: 60,

            dynamicWidth: true,

            minWidth: 50,

            maxWidth: 100,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Full Name`,

            value: getSafeValue(trustee, "fullName", ""),

            x: 50,

            y: yLPA,

            lineWidth: 200,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 100,

            maxWidth: 250,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Relationship`,

            value: getSafeValue(trustee, "relationship", ""),

            x: 50,

            y: yLPA,

            lineWidth: 150,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 80,

            maxWidth: 200,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `Address`,

            value: getSafeValue(trustee, "address", ""),

            x: 50,

            y: yLPA,

            lineWidth: width - 150,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 150,

            maxWidth: width - 150,

            shouldWrapText: true,

            lineHeight: 12,

          });



          yLPA -= 16;



          drawLabeledLine(pageLPA, {

            label: `ID Supplied`,

            value: getSafeValue(trustee, "idSupplied", false) ? "Yes" : "No",

            x: 50,

            y: yLPA,

            lineWidth: 80,

            labelWidth: 70,

            dynamicWidth: true,

            minWidth: 50,

            maxWidth: 100,

          });



          yLPA -= 16;



          // Only show email if ID is not supplied

          if (!getSafeValue(trustee, "idSupplied", false)) {

            drawLabeledLine(pageLPA, {

              label: `Email Address`,

              value: getSafeValue(trustee, "email", ""),

              x: 50,

              y: yLPA,

              lineWidth: 200,

              labelWidth: 70,

              dynamicWidth: true,

              minWidth: 100,

              maxWidth: 250,

            });



            yLPA -= 16;

          }



          yLPA -= 4;

        });



        yLPA -= 10;

      }

    }



    drawLabeledLine(pageLPA, {

      label: "Beneficiary Setup",

      value: fp.beneficiarySetup,

      x: 50,

      y: yLPA,

      lineWidth: width - 180,

      labelWidth: 110,

      dynamicWidth: true,

      minWidth: 150,

      maxWidth: width - 180,

    });



    yLPA -= 24;



    // Family Protection Beneficiaries Section

    const fpBeneficiaries = fp.beneficiaries || [];

    if (fpBeneficiaries.length > 0) {

      // Check if we need a new page before drawing beneficiaries header

      if (yLPA < 180) {

        pageLPA = pdfDoc.addPage([width, height]);

        yLPA = height - 60;

      }



      pageLPA.drawText("Family Protection Beneficiaries", {

        x: 50,

        y: yLPA,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      yLPA -= 18;



      fpBeneficiaries.forEach((beneficiary, bIndex) => {

        // Check if we need a new page before drawing this beneficiary

        if (yLPA < 150) {

          pageLPA = pdfDoc.addPage([width, height]);

          yLPA = height - 60;

        }



        // Beneficiary Title

        drawLabeledLine(pageLPA, {

          label: `Beneficiary ${bIndex + 1} - Title`,

          value: getSafeValue(beneficiary, "title", ""),

          x: 50,

          y: yLPA,

          lineWidth: 100,

          labelWidth: 120,

          dynamicWidth: true,

          minWidth: 60,

          maxWidth: 120,

        });



        yLPA -= 16;



        // Beneficiary Full Name

        drawLabeledLine(pageLPA, {

          label: `Beneficiary ${bIndex + 1} - Full Name`,

          value: getSafeValue(beneficiary, "fullName", ""),

          x: 50,

          y: yLPA,

          lineWidth: 200,

          labelWidth: 120,

          dynamicWidth: true,

          minWidth: 100,

          maxWidth: 250,

        });



        yLPA -= 16;



        // Beneficiary Relationship

        drawLabeledLine(pageLPA, {

          label: `Beneficiary ${bIndex + 1} - Relationship`,

          value: getSafeValue(beneficiary, "relationship", ""),

          x: 50,

          y: yLPA,

          lineWidth: 150,

          labelWidth: 120,

          dynamicWidth: true,

          minWidth: 80,

          maxWidth: 200,

        });



        yLPA -= 16;



        // Beneficiary Address

        drawLabeledLine(pageLPA, {

          label: `Beneficiary ${bIndex + 1} - Address`,

          value: getSafeValue(beneficiary, "address", ""),

          x: 40,

          y: yLPA,

          lineWidth: width - 200,

          labelWidth: 120,

          dynamicWidth: true,

          minWidth: 150,

          maxWidth: width - 200,

          shouldWrapText: true,

          lineHeight: 12,

        });



        yLPA -= 20;



        // Extra space between beneficiaries

        yLPA -= 8;

      });



      yLPA -= 10;

    }



    // Family Protection Beneficiary Groups Section (with percentages)

    const fpBeneficiaryGroups = fp.beneficiaryGroups || [];

    if (fpBeneficiaryGroups.length > 0) {

      // Check if we need a new page before drawing beneficiary groups header

      if (yLPA < 180) {

        pageLPA = pdfDoc.addPage([width, height]);

        yLPA = height - 60;

      }



      pageLPA.drawText("Family Protection Beneficiary Groups", {

        x: 50,

        y: yLPA,

        size: 12,

        font: boldFont,

        color: rgb(0, 0, 0),

      });



      yLPA -= 18;



      fpBeneficiaryGroups.forEach((group, gIndex) => {

        // Check if we need a new page before drawing this group

        if (yLPA < 150) {

          pageLPA = pdfDoc.addPage([width, height]);

          yLPA = height - 60;

        }



        // Group Percentage

        drawLabeledLine(pageLPA, {

          label: `Group ${gIndex + 1} - Percentage`,

          value: getSafeValue(group, "percentage", "")

            ? `${getSafeValue(group, "percentage", "")}%`

            : "",

          x: 50,

          y: yLPA,

          lineWidth: 100,

          labelWidth: 120,

          dynamicWidth: true,

          minWidth: 60,

          maxWidth: 100,

        });



        yLPA -= 16;



        // Group Beneficiaries

        const groupBeneficiaries = group.beneficiaries || [];

        if (groupBeneficiaries.length > 0) {

          groupBeneficiaries.forEach((beneficiary, bIndex) => {

            // Check if we need a new page before drawing this beneficiary

            if (yLPA < 120) {

              pageLPA = pdfDoc.addPage([width, height]);

              yLPA = height - 60;

            }



            // Beneficiary Heading

            pageLPA.drawText(`Beneficiary ${bIndex + 1}`, {

              x: 50,

              y: yLPA,

              size: 10,

              font: boldFont,

              color: rgb(0, 0, 0),

            });



            yLPA -= 14;



            // Beneficiary Name

            drawLabeledLine(pageLPA, {

              label: `Name`,

              value: getSafeValue(beneficiary, "name", ""),

              x: 70,

              y: yLPA,

              lineWidth: 200,

              labelWidth: 80,

              dynamicWidth: true,

              minWidth: 100,

              maxWidth: 250,

            });



            yLPA -= 16;



            // Beneficiary Relationship

            drawLabeledLine(pageLPA, {

              label: `Relationship`,

              value: getSafeValue(beneficiary, "relationship", ""),

              x: 70,

              y: yLPA,

              lineWidth: 150,

              labelWidth: 80,

              dynamicWidth: true,

              minWidth: 80,

              maxWidth: 200,

            });



            yLPA -= 16;



            // Beneficiary Share

            drawLabeledLine(pageLPA, {

              label: `Percentage`,

              value: getSafeValue(beneficiary, "share", ""),

              x: 70,

              y: yLPA,

              lineWidth: 100,

              labelWidth: 80,

              dynamicWidth: true,

              minWidth: 60,

              maxWidth: 100,

            });



            yLPA -= 20;

          });

        }



        // Extra space between groups

        yLPA -= 8;

      });



      yLPA -= 10;

    }



    const fpBoxHeight = 70;

    const fpBoxY = yLPA - fpBoxHeight + 20;



    // Check if we need a new page before drawing Additional Information

    if (yLPA < 120) {

      pageLPA = pdfDoc.addPage([width, height]);

      yLPA = height - 60;

    }



    pageLPA.drawText("Additional Information / Notes", {

      x: 50,

      y: yLPA,

      size: 10,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    pageLPA.drawRectangle({

      x: 45,

      y: fpBoxY,

      width: width - 90,

      height: fpBoxHeight,

      color: rgb(0.96, 0.96, 0.96),

      borderWidth: 0.5,

      borderColor: rgb(0.85, 0.85, 0.85),

    });



    if (fp.additionalInfo) {

      pageLPA.drawText(fp.additionalInfo, {

        x: 52,

        y: fpBoxY + fpBoxHeight - 16,

        size: 9,

        font,

        color: rgb(0, 0, 0),

        maxWidth: width - 110,

        lineHeight: 12,

      });

    }



    yLPA = fpBoxY - 30;



    drawYesNoRow(pageLPA, {

      label: "Disabled beneficiaries?",

      value: fp.disabledBeneficiaries,

      x: 50,

      y: yLPA,

    });



    yLPA -= 22;



    drawYesNoRow(pageLPA, {

      label: "Potential claims against the estate?",

      value: fp.potentialClaims,

      x: 50,

      y: yLPA,

    });



    yLPA -= 22;



    drawYesNoRow(pageLPA, {

      label: "Main residence owned?",

      value: fp.mainResidence,

      x: 50,

      y: yLPA,

    });



    yLPA -= 22;



    drawYesNoRow(pageLPA, {

      label: "Mortgage or equity release?",

      value: fp.mortgageOrEquity,

      x: 50,

      y: yLPA,

    });



    yLPA -= 22;



    drawLabeledLine(pageLPA, {

      label: "RX1 / TR1",

      value: fp.rx1OrTr1,

      x: 50,

      y: yLPA,

      lineWidth: 180,

      labelWidth: 70,

      dynamicWidth: true,

      minWidth: 100,

      maxWidth: 200,

    });



    yLPA -= 30;



    const tr = fp.trustReasons || {};



    // Check if we need a new page before drawing Reasons for Trust

    if (yLPA < 150) {

      pageLPA = pdfDoc.addPage([width, height]);

      yLPA = height - 60;

    }



    pageLPA.drawText("Reasons for Trust (if applicable)", {

      x: 50,

      y: yLPA,

      size: 10,

      font: boldFont,

      color: rgb(0, 0, 0),

    });



    yLPA -= 18;



    const reasonRow = (label, key) => {

      drawYesNoRow(pageLPA, {

        label,

        value: tr[key],

        x: 50,

        y: yLPA,

      });

      yLPA -= 18;

    };



    reasonRow("Reduce probate / delays", "reduceProbate");

    reasonRow("Sideways disinheritance", "sidewaysDisinheritance");

    reasonRow("Divorce claims", "divorceClaims");

    reasonRow("Generational IHT", "generationalIHT");

    reasonRow("Claims against estate", "claimsAgainstEstate");



    /**

     * The existing ID information and signatures handling below is kept as‑is

     * so uploaded documents and signature images still appear at the end of

     * the pack, after the redesigned questionnaire‑style pages.

     */



    // Shared Y position for ID pages and signatures pages

    let yPosition = height - 60;



    // ID Information Section

    if (safeFormData.idInformation) {

      // Start a fresh page for ID information

      page = pdfDoc.addPage([width, height]);

      yPosition = height - 60;



      // Draw section header

      yPosition = drawSectionHeader(page, "ID INFORMATION", yPosition + 4);

      yPosition -= 10; // Space after header



      console.log("Full formData received:", formData); // Log the entire formData

      const safeFormData = cleanFormData(formData);

      console.log("Safe formData after cleaning:", safeFormData); // Log cleaned data

      console.log(

        "ServicesRequired field:",

        safeFormData.clientDetails?.servicesRequired,

      ); // Log services field specifically



      if (

        safeFormData.idInformation.idDocuments &&

        safeFormData.idInformation.idDocuments.length > 0

      ) {

        page.drawText("ID Documents:", {

          x: leftMargin,

          y: yPosition,

          size: 12,

          font: boldFont,

        });

        yPosition -= 20;



        for (const doc of safeFormData.idInformation.idDocuments) {

          // Skip if no document object

          if (!doc) continue;



          // Log document structure for debugging

          console.log("Processing document:", {

            name: doc.name,

            type: doc.type,

            hasUrl: !!doc.url,

            hasPreview: !!doc.preview,

            keys: Object.keys(doc),

          });



          // Skip if no URL, preview, or data is available

          if (!doc.url && !doc.preview && !doc.data) {

            console.warn(

              "Skipping document - no URL, preview, or data available:",

              doc.name || "Unnamed document",

            );

            continue;

          }



          if (yPosition < 200) {

            // Leave more space at bottom for images

            page = pdfDoc.addPage([width, height]);

            yPosition = height - 50;

          }



          try {

            console.log(

              `Processing document: ${doc.name || "Unnamed Document"}, type: ${doc.type

              }, URL: ${doc.url || doc.preview || "data-uri"}`,

            );



            const docUrl = doc.url || doc.preview || doc.data;

            if (!docUrl) {

              throw new Error(

                "Document source is missing (no URL, preview, or data)",

              );

            }



            let image; // Define image variable at the start of the try block



            // Handle data URLs (including the 'data' property from the ID component)

            if (docUrl.startsWith("data:") || doc.data) {

              // If we have a 'data' property, use that as the source

              const dataUrl = doc.data || docUrl;

              console.log(

                "Processing data URL:",

                dataUrl.substring(0, 50) + "...",

              );

              console.log("Processing data URL");

              const base64Data = dataUrl.split(",")[1];

              if (!base64Data) {

                throw new Error("Invalid data URL format");

              }

              const imageBytes = Uint8Array.from(atob(base64Data), (c) =>

                c.charCodeAt(0),

              );



              // Try PNG first, then JPG if that fails

              try {

                if (doc.type && doc.type.includes("png")) {

                  image = await pdfDoc.embedPng(imageBytes);

                } else if (

                  doc.type &&

                  (doc.type.includes("jpeg") || doc.type.includes("jpg"))

                ) {

                  image = await pdfDoc.embedJpg(imageBytes);

                } else {

                  // Try both formats if type is not specified

                  try {

                    image = await pdfDoc.embedPng(imageBytes);

                  } catch (e) {

                    console.log("Not a PNG, trying JPG...");

                    image = await pdfDoc.embedJpg(imageBytes);

                  }

                }

              } catch (error) {

                console.error("Error embedding image:", error);

                throw new Error(`Failed to process image: ${error.message}`);

              }

            }

            // Handle regular URLs

            else if (docUrl) {

              console.log(`Fetching image from URL: ${docUrl}`);

              const response = await fetch(docUrl, {

                mode: "cors",

                cache: "no-cache",

                credentials: "same-origin",

              });



              if (!response.ok) {

                throw new Error(

                  `Failed to fetch image: ${response.status} ${response.statusText}`,

                );

              }



              const imageBytes = await response.arrayBuffer();



              // Try to determine image type from response headers if not provided

              const contentType =

                response.headers.get("content-type") || doc.type;

              console.log(

                `Content-Type: ${contentType}, Bytes length: ${imageBytes.byteLength}`,

              );



              if (contentType && contentType.includes("png")) {

                image = await pdfDoc.embedPng(imageBytes);

              } else if (

                contentType &&

                (contentType.includes("jpeg") || contentType.includes("jpg"))

              ) {

                image = await pdfDoc.embedJpg(imageBytes);

              } else if (docUrl.toLowerCase().endsWith(".png")) {

                image = await pdfDoc.embedPng(imageBytes);

              } else if (docUrl.toLowerCase().match(/\.jpe?g$/)) {

                image = await pdfDoc.embedJpg(imageBytes);

              } else {

                // Try both formats as a fallback

                try {

                  image = await pdfDoc.embedPng(imageBytes);

                } catch (e) {

                  console.log("Not a PNG, trying JPG...");

                  try {

                    image = await pdfDoc.embedJpg(imageBytes);

                  } catch (e2) {

                    console.error("Failed to embed image:", e2);

                    throw new Error("Unsupported image format");

                  }

                }

              }

            }



            // Calculate dimensions to maintain aspect ratio

            const aspectRatio = image.width / image.height;

            const maxWidth = 300;

            const maxHeight = 300;



            let imgWidth = maxWidth;

            let imgHeight = imgWidth / aspectRatio;



            if (imgHeight > maxHeight) {

              imgHeight = maxHeight;

              imgWidth = imgHeight * aspectRatio;

            }



            // Check if we need a new page for the image

            if (yPosition - imgHeight - 40 < 100) {

              page = pdfDoc.addPage([width, height]);

              yPosition = height - 50;

            }



            // Draw the image

            page.drawImage(image, {

              x: leftMargin,

              y: yPosition - imgHeight,

              width: imgWidth,

              height: imgHeight,

            });



            // Add caption

            page.drawText(doc.name || "ID Document", {

              x: leftMargin,

              y: yPosition - imgHeight - 15,

              size: 10,

            });



            yPosition -= imgHeight + 30; // Add space after image

          } catch (error) {

            const errorMsg = `Error loading ${doc.name || "document"}: ${error.message || "Unknown error"

              }`;

            console.error(errorMsg, error);



            // Show error message with more details

            const errorLines = [

              `[X] ${doc.name || "Document"}`,

              `Type: ${doc.type || "unknown"}`,

              `Error: ${error.message || "Failed to load image"}`,

            ];



            // Add URL if available (truncate if too long)

            if (doc.url || doc.preview) {

              const url =

                (doc.url || doc.preview).substring(0, 50) +

                ((doc.url || doc.preview).length > 50 ? "..." : "");

              errorLines.push(`URL: ${url}`);

            }



            // Draw each line of the error message

            errorLines.forEach((line, index) => {

              if (yPosition < 50) {

                page = pdfDoc.addPage([width, height]);

                yPosition = height - 50;

              }



              page.drawText(line, {

                x: leftMargin,

                y: yPosition,

                size: 9,

                color: rgb(0.8, 0, 0), // Dark red for better visibility

              });

              yPosition -= 12;

            });



            yPosition -= 30; // Extra space after error

          }

        }

        yPosition -= 20; // Extra space after section

      }



      // Process Supporting Documents

      if (

        safeFormData.idInformation.supportingDocuments &&

        safeFormData.idInformation.supportingDocuments.length > 0

      ) {

        page.drawText("Supporting Documents:", {

          x: leftMargin,

          y: yPosition,

          size: 12,

          font: boldFont,

        });

        yPosition -= 20;



        // Process each supporting document

        for (const doc of safeFormData.idInformation.supportingDocuments) {

          // Skip if no document object

          if (!doc) continue;



          // Log document structure for debugging

          console.log("Processing supporting document:", {

            name: doc.name,

            type: doc.type,

            hasUrl: !!doc.url,

            hasPreview: !!doc.preview,

            hasData: !!doc.data,

            keys: Object.keys(doc),

          });



          // Skip if no URL, preview, or data is available

          if (!doc.url && !doc.preview && !doc.data) {

            console.warn(

              "Skipping supporting document - no URL, preview, or data available:",

              doc.name || "Unnamed document",

            );

            continue;

          }



          if (yPosition < 200) {

            page = pdfDoc.addPage([width, height]);

            yPosition = height - 50;

          }



          let image;

          try {

            const docUrl = doc.url || doc.preview || doc.data;



            // Handle data URLs (including the 'data' property from the ID component)

            if (docUrl.startsWith("data:") || doc.data) {

              const dataUrl = doc.data || docUrl;

              console.log(

                "Processing supporting document data URL:",

                dataUrl.substring(0, 50) + "...",

              );



              const base64Data = dataUrl.split(",")[1];

              if (!base64Data) {

                throw new Error("Invalid data URL format");

              }

              const imageBytes = Uint8Array.from(atob(base64Data), (c) =>

                c.charCodeAt(0),

              );



              // Try PNG first, then JPG if that fails

              if (doc.type && doc.type.includes("png")) {

                image = await pdfDoc.embedPng(imageBytes);

              } else if (

                doc.type &&

                (doc.type.includes("jpeg") || doc.type.includes("jpg"))

              ) {

                image = await pdfDoc.embedJpg(imageBytes);

              } else {

                // Try both formats if type is not specified

                try {

                  image = await pdfDoc.embedPng(imageBytes);

                } catch (e) {

                  console.log("Not a PNG, trying JPG...");

                  image = await pdfDoc.embedJpg(imageBytes);

                }

              }

            }

            // Handle regular URLs

            else {

              const response = await fetch(docUrl);

              if (!response.ok) throw new Error("Failed to fetch image");



              const imageBytes = await response.arrayBuffer();

              const contentType =

                response.headers.get("content-type") || doc.type;



              if (contentType && contentType.includes("png")) {

                image = await pdfDoc.embedPng(imageBytes);

              } else if (

                contentType &&

                (contentType.includes("jpeg") || contentType.includes("jpg"))

              ) {

                image = await pdfDoc.embedJpg(imageBytes);

              } else {

                // Try both formats if content type is not specified

                try {

                  image = await pdfDoc.embedPng(imageBytes);

                } catch (e) {

                  console.log("Not a PNG, trying JPG...");

                  image = await pdfDoc.embedJpg(imageBytes);

                }

              }

            }



            const aspectRatio = image.width / image.height;

            const maxWidth = 300;

            const maxHeight = 300;



            let imgWidth = maxWidth;

            let imgHeight = imgWidth / aspectRatio;



            if (imgHeight > maxHeight) {

              imgHeight = maxHeight;

              imgWidth = imgHeight * aspectRatio;

            }



            if (yPosition - imgHeight - 40 < 100) {

              page = pdfDoc.addPage([width, height]);

              yPosition = height - 50;

            }



            page.drawImage(image, {

              x: leftMargin,

              y: yPosition - imgHeight,

              width: imgWidth,

              height: imgHeight,

            });



            page.drawText(doc.name || "Supporting Document", {

              x: leftMargin,

              y: yPosition - imgHeight - 15,

              size: 10,

            });



            yPosition -= imgHeight + 30;

          } catch (error) {

            const errorMsg = `Error loading supporting document ${doc.name || ""

              }: ${error.message || "Unknown error"}`;

            console.error(errorMsg, error);



            // Show error message with more details

            const errorLines = [

              `[X] ${doc.name || "Supporting Document"}`,

              `Type: ${doc.type || "unknown"}`,

              `Error: ${error.message || "Failed to load image"}`,

            ];



            // Add source if available (truncate if too long)

            const source = doc.url || doc.preview || doc.data;

            if (source) {

              const displaySource =

                source.substring(0, 50) + (source.length > 50 ? "..." : "");

              errorLines.push(`Source: ${displaySource}`);

            }



            // Draw each line of the error message

            errorLines.forEach((line) => {

              if (yPosition < 50) {

                page = pdfDoc.addPage([width, height]);

                yPosition = height - 50;

              }



              page.drawText(line, {

                x: leftMargin,

                y: yPosition,

                size: 9,

                color: rgb(0.8, 0, 0), // Dark red for better visibility

              });

              yPosition -= 12;

            });



            yPosition -= 10; // Extra space after error

          }

        }

      }

    }



    // Handle signatures if available - placed after ID Information section

    if (safeFormData.signatures) {

      // Check if we need a new page

      if (yPosition < 200) {

        page = pdfDoc.addPage([width, height]);

        yPosition = height - 50;

      } else {

        yPosition -= 30; // Add some space before the signatures section

      }



      // Draw section header with consistent styling

      yPosition = drawSectionHeader(page, "CLIENT SIGNATURES", yPosition + 4);

      yPosition -= 10; // Space after header



      // Helper function to draw a signature

      const drawSignature = async (signatureData, clientLabel, xPosition) => {

        if (!signatureData || typeof signatureData !== "string") {

          console.log(`No signature data for ${clientLabel}`);

          return;

        }



        try {

          // Check if it's a base64 data URL

          if (signatureData.startsWith("data:image/")) {

            console.log(`Processing ${clientLabel} signature`);

            const base64Data = signatureData.split(",")[1];

            if (!base64Data) {

              console.error(`Invalid base64 data in ${clientLabel} signature`);

              return;

            }



            // Decode base64 to bytes

            const imageBytes = Uint8Array.from(atob(base64Data), (c) =>

              c.charCodeAt(0),

            );



            // Determine image type and embed

            const isPng = signatureData.includes("image/png");

            const signatureImage = isPng

              ? await pdfDoc.embedPng(imageBytes)

              : await pdfDoc.embedJpg(imageBytes);



            // Get image dimensions to maintain aspect ratio

            const imageDims = signatureImage.scale(1);

            const signatureWidth = 200;

            const signatureHeight =

              (imageDims.height / imageDims.width) * signatureWidth;



            // Check if we need a new page

            if (yPosition - signatureHeight - 40 < 100) {

              page = pdfDoc.addPage([width, height]);

              yPosition = height - 50;

            }



            // Add signature label

            page.drawText(`${clientLabel} Signature:`, {

              x: xPosition,

              y: yPosition,

              size: 12,

              font: boldFont,

            });



            // Draw the signature image

            page.drawImage(signatureImage, {

              x: xPosition,

              y: yPosition - 20 - signatureHeight, // Position below the label

              width: signatureWidth,

              height: signatureHeight,

            });

            console.log(`${clientLabel} signature drawn successfully`);

          } else {

            console.log(

              `${clientLabel} signature data does not start with data:image/`,

            );

          }

        } catch (error) {

          console.error(`Error drawing ${clientLabel} signature:`, error);

        }

      };



      // Draw signatures side by side

      const signatureWidth = 200;

      const signatureSpacing = 50; // Space between signatures

      const totalWidth = signatureWidth * 2 + signatureSpacing;

      const startX = (width - totalWidth) / 2; // Center the signatures



      // Draw Client 1 signature on the left

      if (safeFormData.signatures.client1) {

        await drawSignature(

          safeFormData.signatures.client1,

          "Client 1",

          startX,

        );

      }



      // Draw Client 2 signature on the right

      if (safeFormData.signatures.client2) {

        await drawSignature(

          safeFormData.signatures.client2,

          "Client 2",

          startX + signatureWidth + signatureSpacing,

        );

      }

    }



    // Page numbering removed as per user request



    // Save the PDF with all pages

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });



    console.log("=== PDF BLOB CREATED ===");

    console.log("Blob type:", blob.type);

    console.log("Blob size:", blob.size);

    console.log("Is Blob:", blob instanceof Blob);



    return blob;

  } catch (error) {

    console.error("PDF Generation Error:", {

      message: error.message,

      stack: error.stack,

      formData: safeFormData

        ? JSON.stringify(safeFormData, null, 2)

        : "No form data",

    });

    throw new Error(`Failed to generate PDF: ${error.message}`);

  }

};



// Remove the generateReceiptPDF function as it's not being used and could cause confusion



const generateReceiptPDF = async (formData = {}) => {

  try {

    if (!formData || typeof formData !== "object") {

      console.warn("No form data provided for receipt generation");

      return false;

    }



    // Create a new PDF document for receipt

    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    const { width, height } = page.getSize();



    // Add fonts

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);



    let yPosition = height - 50;

    const fontSize = 12;

    const lineHeight = 20;



    // Add receipt header

    const drawCenteredText = async (text, y, size = 14, isBold = true) => {

      const textWidth = font.widthOfTextAtSize(text, size);

      page.drawText(text, {

        x: (width - textWidth) / 2,

        y,

        size,

        font: isBold ? boldFont : font,

        color: rgb(0, 0, 0.8),

      });

    };



    // Logo and header

    try {

      await drawCenteredText("The Planning Bee", yPosition, 24);

      yPosition -= 40;



      await drawCenteredText("RECEIPT", yPosition, 20);

      yPosition -= 40;



      // Receipt details

      const details = [

        { label: "Receipt #", value: `TPB-${Date.now()}` },

        { label: "Date", value: new Date().toLocaleDateString() },

        {

          label: "Client",

          value: getNestedValue(safeFormData, "client.fullName", "N/A"),

        },

      ];



      // Draw receipt details

      for (const detail of details) {

        const labelText = `${detail.label}:`;

        const labelWidth = font.widthOfTextAtSize(labelText, fontSize);



        page.drawText(labelText, {

          x: 100,

          y: yPosition,

          size: fontSize,

          font: boldFont,

        });



        page.drawText(detail.value, {

          x: 120 + labelWidth,

          y: yPosition,

          size: fontSize,

          font: font,

        });



        yPosition -= lineHeight * 1.5;

      }



      yPosition -= 30;



      // Add thank you message

      await drawCenteredText("Thank you for your business!", yPosition, 14);

      yPosition -= 40;



      // Add contact information

      const contactInfo = [

        "The Planning Bee",

        "123 Estate Planning St",

        "London, UK",

        "contact@planningbee.com",

        "+44 123 456 7890",

      ];



      for (const line of contactInfo) {

        await drawCenteredText(line, yPosition, 10, false);

        yPosition -= 15;

      }

    } catch (error) {

      console.error("Error drawing receipt content:", error);

      // Continue with basic receipt if there's an error

      page.drawText("Receipt - The Planning Bee", {

        x: 50,

        y: height - 50,

        size: 14,

        font: boldFont,

      });

    }



    // Save receipt PDF with timestamp

    const pdfBytes = await pdfDoc.save();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const blob = new Blob([pdfBytes], { type: "application/pdf" });



    console.log("=== PDF BLOB CREATED ===");

    console.log("Blob type:", blob.type);

    console.log("Blob size:", blob.size);

    console.log("Is Blob:", blob instanceof Blob);



    // Always return blob for this service

    return blob;

  } catch (error) {

    console.error("Error generating receipt PDF:", {

      message: error.message,

      stack: error.stack,

    });

    throw new Error(`Failed to generate receipt PDF: ${error.message}`);

  }

};



export default generatePDFBlob;

