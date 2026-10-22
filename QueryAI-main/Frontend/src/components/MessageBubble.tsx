import {
  Sparkles,
  FileText,
  Image as ImageIcon,
  Presentation,
  FileType,
  ExternalLink,
} from 'lucide-react';

import type {
  Message,
  Attachment,
} from '@/types';

import Markdown from './Markdown';


// ==================================================
// GET OPEN URL
// ==================================================

function getAttachmentOpenUrl(
  att: Attachment
): string | null {

  if (!att.url) {
    return null;
  }

  // ------------------------------------------
  // PDF / IMAGE
  // Open directly in a new browser tab
  // ------------------------------------------

  if (
    att.type === 'pdf' ||
    att.type === 'image'
  ) {
    return att.url;
  }


  // ------------------------------------------
  // DOCX / PPTX
  // Use Microsoft Office Online Viewer
  // ------------------------------------------

  if (
    att.type === 'doc' ||
    att.type === 'ppt'
  ) {

    return (
      `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
        att.url
      )}`
    );
  }


  return att.url;
}


// ==================================================
// ATTACHMENT DISPLAY
// ==================================================

function AttachmentCard({
  att,
}: {
  att: Attachment;
}) {

  const Icon =
    att.type === 'image'
      ? ImageIcon
      : att.type === 'pdf'
      ? FileText
      : att.type === 'ppt'
      ? Presentation
      : FileType;


  const openUrl =
    getAttachmentOpenUrl(att);


  // ==================================================
  // IMAGE
  // ==================================================

  if (
    att.type === 'image' &&
    att.url
  ) {

    return (
      <a
        href={openUrl ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="
          mb-2
          block
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-black/10
          max-w-sm
          cursor-pointer
          hover:opacity-90
          transition
        "
        title="Open image"
      >

        <img
          src={att.url}
          alt={att.name}
          className="
            block
            w-full
            max-h-80
            object-contain
          "
        />

        <div
          className="
            flex
            items-center
            gap-2
            px-3
            py-2.5
            bg-surface-2
          "
        >

          <ImageIcon
            size={15}
            className="
              text-accent
              shrink-0
            "
          />

          <div
            className="
              min-w-0
              flex-1
            "
          >

            <p
              className="
                text-xs
                font-medium
                text-app
                truncate
              "
            >
              {att.name}
            </p>

            <p
              className="
                text-[11px]
                text-muted
              "
            >
              Image • Click to open
            </p>

          </div>

          <ExternalLink
            size={14}
            className="
              text-muted
              shrink-0
            "
          />

        </div>

      </a>
    );
  }


  // ==================================================
  // FILE CARD
  // ==================================================

  const fileCard = (
    <div
      className="
        flex
        items-center
        gap-3
        px-3
        py-3
        rounded-xl
        bg-surface-2
        border
        border-app
        max-w-sm
      "
    >

      {/* FILE ICON */}

      <div
        className="
          shrink-0
          w-10
          h-10
          rounded-lg
          bg-app
          border
          border-app
          flex
          items-center
          justify-center
        "
      >

        <Icon
          size={20}
          className="text-accent"
        />

      </div>


      {/* FILE INFORMATION */}

      <div
        className="
          min-w-0
          flex-1
        "
      >

        <p
          className="
            text-sm
            font-medium
            text-app
            truncate
          "
        >
          {att.name}
        </p>


        <p
          className="
            text-xs
            text-muted
            mt-0.5
          "
        >

          {att.type === 'pdf'
            ? 'PDF • Click to open'
            : att.type === 'ppt'
            ? 'PowerPoint • Click to open'
            : 'Document • Click to open'}

        </p>

      </div>


      {/* OPEN ICON */}

      {att.url && (

        <ExternalLink
          size={16}
          className="
            text-muted
            shrink-0
          "
        />

      )}

    </div>
  );


  // ==================================================
  // FILE WITH URL
  // ==================================================

  if (
    att.url &&
    openUrl
  ) {

    return (
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          mb-2
          block
          cursor-pointer
          hover:opacity-90
          transition
        "
        title={
          att.type === 'pdf'
            ? 'Open PDF'
            : att.type === 'ppt'
            ? 'Open PowerPoint'
            : att.type === 'doc'
            ? 'Open document'
            : 'Open attachment'
        }
      >

        {fileCard}

      </a>
    );
  }


  // ==================================================
  // FILE WITHOUT URL
  // ==================================================

  return (
    <div className="mb-2">
      {fileCard}
    </div>
  );
}


// ==================================================
// MESSAGE BUBBLE
// ==================================================

export default function MessageBubble({
  message,
}: {
  message: Message;
}) {

  const isUser =
    message.role === 'user';


  return (

    <div
      className={`
        flex
        gap-3
        animate-fade-in-up
        ${
          isUser
            ? 'flex-row-reverse'
            : 'flex-row'
        }
      `}
    >

      {/* =========================================
          AVATAR
      ========================================= */}

      <div
        className="
          shrink-0
          mt-0.5
        "
      >

        {isUser ? (

          <div
            className="
              w-8
              h-8
              rounded-full
              bg-surface-2
              border
              border-app
              flex
              items-center
              justify-center
              text-xs
              font-medium
              text-muted
            "
          >
            U
          </div>

        ) : (

          <div
            className="
              w-8
              h-8
              rounded-lg
              bg-accent
              flex
              items-center
              justify-center
            "
          >

            <Sparkles
              size={16}
              className="text-white"
              strokeWidth={2.5}
            />

          </div>

        )}

      </div>


      {/* =========================================
          MESSAGE CONTENT
      ========================================= */}

      <div
        className={`
          max-w-[80%]
          ${
            isUser
              ? 'items-end'
              : 'items-start'
          }
          flex
          flex-col
        `}
      >

        {/* =====================================
            USER MESSAGE
        ===================================== */}

        {isUser ? (

          <div
            className="
              px-3
              py-3
              rounded-2xl
              rounded-tr-sm
              bg-accent
              text-white
              text-sm
              leading-relaxed
            "
          >

            {/* ATTACHMENTS */}

            {message.attachments &&
              message.attachments.length > 0 && (

                <div className="mb-2">

                  {message.attachments.map(
                    (attachment) => (

                      <AttachmentCard
                        key={attachment.id}
                        att={attachment}
                      />

                    )
                  )}

                </div>

              )}


            {/* TEXT */}

            {message.content && (

              <p
                className="
                  whitespace-pre-wrap
                "
              >
                {message.content}
              </p>

            )}

          </div>

        ) : (

          /* =====================================
             ASSISTANT MESSAGE
          ===================================== */

          <div
            className="
              px-4
              py-3
              rounded-2xl
              rounded-tl-sm
              bg-surface
              border
              border-app
              text-app
              text-sm
              leading-relaxed
            "
          >

            <Markdown
              content={
                message.content
              }
            />

          </div>

        )}

      </div>

    </div>
  );
}
