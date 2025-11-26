"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { useTranslations } from "@/lib/use-translations"

const dialogAnimation = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { type: "spring", stiffness: 300, damping: 30 },
}

// Delete Item Dialog - When removing last item
export function DeleteItemDialog({ open, onOpenChange, onConfirm }) {
  const { t } = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div {...dialogAnimation}>
          <DialogHeader className="mt-2">
            <DialogTitle className="text-xl">
              {t("DeleteEntireSwapConfirmation") || "Delete Entire Swap?"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("Thisisthelastiteminyouroffer_deletingitwilldeletetheentireswap") ||
                "This is the last item in your offer. Deleting it will delete the entire swap. Are you sure?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
            <DialogClose asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={onConfirm}
              >
                {t("DeleteEntireSwap") || "Delete Entire Swap"}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("Cancel") || "Cancel"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// Reject Swap Dialog
export function RejectSwapDialog({ open, onOpenChange, onConfirm }) {
  const { t } = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div {...dialogAnimation}>
          <DialogHeader className="mt-2">
            <DialogTitle className="text-xl">
              {t("RejectSwapConfirmation") || "Reject Swap?"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("AreyousureyouwanttorejectthisswapThisactioncannotbeundone") ||
                "Are you sure you want to reject this swap? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
            <DialogClose asChild>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={onConfirm}
              >
                {t("RejectSwap") || "Reject Swap"}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("Cancel") || "Cancel"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// Complete Swap Dialog
export function CompleteSwapDialog({ open, onOpenChange, onConfirm }) {
  const { t } = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div {...dialogAnimation}>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {t("CompleteSwap") || "Complete Swap"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              <ul className="space-y-2 mt-2 list-disc list-inside">
                <li>
                  {t("AreyousureyouwanttoCompletethisswap") ||
                    "Are you sure you want to Complete this swap?"}
                </li>
                <li>
                  {t("Ifyoucompletetheswapyouwillnotbeabletoundothisaction") ||
                    "If you complete the swap, you will not be able to undo this action."}
                </li>
                <li>{t("Chatwillbeclosed.") || "Chat will be closed."}</li>
                <li>{t("Itemswillberemoved") || "Items will be removed."}</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
            <DialogClose asChild>
              <Button className="w-full sm:w-auto" onClick={onConfirm}>
                {t("Complete") || "Complete"}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                {t("Cancel") || "Cancel"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
