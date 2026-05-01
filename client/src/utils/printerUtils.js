//returns if any of the toner levels of a printer
//are lower than 3%
export function isLowToner(printer) {
  return (
    (printer.black != null && printer.black <= 3) ||
    (printer.cyan != null && printer.cyan <= 3) ||
    (printer.magenta != null && printer.magenta <= 3) ||
    (printer.yellow != null && printer.yellow <= 3)
  )
}

//the functions below are the same as function in Navbar.vue, 
//simply here for testing purposes
export function getStatus(p) {
    if (p.is_error || p.status?.toLowerCase().includes("offline")) {
        return "ERROR"
    }
    return "LOW TONER"
}

export function getSeverityClass(p) {
    if (p.is_error || p.status?.toLowerCase().includes("offline")) {
        return "error-item"
    }
    return "warning-item"
}

export function filterProblemPrinters(printers) {
  return printers.filter(p =>
    p.is_error ||
    p.status?.toLowerCase().includes("offline") ||
    isLowToner(p)
  )
}